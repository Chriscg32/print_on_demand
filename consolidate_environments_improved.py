

import os
import re
import subprocess
import pkg_resources
from pathlib import Path
from packaging.version import parse as parse_version

def find_venv_directories(base_dir):
    """Find all virtual environment directories in the given base directory."""
    venv_dirs = []
    
    # Common virtual environment directory names
    venv_names = ['.venv', 'venv', 'env', '.env']
    
    # Walk through the directory structure
    for root, dirs, _ in os.walk(base_dir):
        for dir_name in dirs:
            # Check if the directory is a virtual environment
            if (dir_name in venv_names or 
                (os.path.exists(os.path.join(root, dir_name, 'Scripts', 'activate')) and 
                 os.path.exists(os.path.join(root, dir_name, 'Lib', 'site-packages')))):
                venv_path = os.path.join(root, dir_name)
                venv_dirs.append(venv_path)
    
    return venv_dirs

def get_installed_packages(venv_path):
    """Get all installed packages in a virtual environment."""
    site_packages = os.path.join(venv_path, 'Lib', 'site-packages')
    
    if not os.path.exists(site_packages):
        return []
    
    # Use a subprocess to run pip freeze in the virtual environment
    python_exe = os.path.join(venv_path, 'Scripts', 'python.exe')
    if not os.path.exists(python_exe):
        return []
    
    try:
        result = subprocess.run(
            [python_exe, '-m', 'pip', 'freeze'],
            capture_output=True,
            text=True,
            check=True
        )
        packages = result.stdout.strip().split('\n')
        return [pkg for pkg in packages if pkg and not pkg.startswith('#')]
    except subprocess.CalledProcessError:
        print(f"Warning: Failed to get packages from {venv_path}")
        return []

def parse_package_line(line):
    """Parse a package line from pip freeze output."""
    # Handle git/URL installations
    if line.startswith('-e ') or line.startswith('git+') or '@' in line:
        return None, None
    
    # Handle regular package==version format
    match = re.match(r'^([^=<>]+)([=<>]+)(.+)$', line)
    if match:
        package_name = match.group(1).strip().lower()
        version = match.group(3).strip()
        return package_name, version
    
    return line.strip().lower(), None

def consolidate_requirements(venv_dirs):
    """Consolidate requirements from multiple virtual environments."""
    package_versions = {}
    
    for venv_path in venv_dirs:
        print(f"Processing {venv_path}...")
        packages = get_installed_packages(venv_path)
        
        for pkg_line in packages:
            package_name, version = parse_package_line(pkg_line)
            
            if not package_name:
                continue
                
            # Skip setuptools, pip, and wheel as they're part of the base environment
            if package_name in ['setuptools', 'pip', 'wheel']:
                continue
                
            if package_name not in package_versions:
                package_versions[package_name] = []
            
            if version:
                package_versions[package_name].append(version)
    
    # Select the latest version for each package
    consolidated = {}
    for package, versions in package_versions.items():
        if versions:
            try:
                latest_version = max(versions, key=parse_version)
                consolidated[package] = latest_version
            except Exception as e:
                print(f"Warning: Could not determine latest version for {package}: {e}")
                consolidated[package] = versions[0]  # Use the first version as fallback
        else:
            consolidated[package] = None  # No version specified
    
    return consolidated

def write_requirements_file(packages, output_file):
    """Write consolidated packages to a requirements file."""
    with open(output_file, 'w') as f:
        for package, version in sorted(packages.items()):
            if version:
                f.write(f"{package}=={version}\n")
            else:
                f.write(f"{package}\n")

def main():
    base_dir = os.getcwd()
    print(f"Scanning for virtual environments in {base_dir}...")
    
    venv_dirs = find_venv_directories(base_dir)
    
    if not venv_dirs:
        print("No virtual environments found.")
        return
    
    print(f"\nFound {len(venv_dirs)} virtual environments:")
    for i, venv_path in enumerate(venv_dirs, 1):
        print(f"{i}. {venv_path}")
    
    consolidated_packages = consolidate_requirements(venv_dirs)
    output_file = os.path.join(base_dir, "consolidated_requirements.txt")
    
    write_requirements_file(consolidated_packages, output_file)
    
    print(f"\nCreated consolidated requirements file at {output_file}")
    print(f"Found {len(consolidated_packages)} unique packages across all environments.")
    
    print("\n=== NEXT STEPS ===")
    print("1. Create a new virtual environment:")
    print("   python -m venv new_venv")
    print("\n2. Activate the new environment:")
    print("   new_venv\\Scripts\\activate")
    print("\n3. Install the consolidated requirements:")
    print("   pip install -r consolidated_requirements.txt")
    print("\n4. Once you've verified everything works, you can delete the old environments.")

if __name__ == "__main__":
    main()