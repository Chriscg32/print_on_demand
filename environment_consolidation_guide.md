# Guide to Consolidate Virtual Environments

This guide will help you consolidate multiple virtual environments into a single one for your Print-on-Demand project.

## Step 1: Backup Your Project

Before making any changes, create a backup of your project:

```bash
# Create a backup
xcopy /E /I /H C:\Users\chris\cgapp\print_on_demand C:\Users\chris\cgapp\print_on_demand_backup
```

## Step 2: Run the Consolidation Script

1. Save the `consolidate_environments.py` script to your project root directory
2. Open a command prompt and navigate to your project directory:

```bash
cd C:\Users\chris\cgapp\print_on_demand
```

3. Run the script:

```bash
python consolidate_environments.py
```

The script will:
- Find all virtual environments in your project
- Extract the list of packages from each environment
- Create a consolidated `requirements.txt` file with all unique packages

## Step 3: Create a New Virtual Environment

Create a single virtual environment at the project root:

```bash
# Create a new virtual environment
python -m venv .venv

# Activate the environment
.venv\Scripts\activate
```

## Step 4: Install Consolidated Requirements

Install all the packages from the consolidated requirements file:

```bash
pip install -r requirements.txt
```

## Step 5: Update Your Project Configuration

If your project has any scripts or configuration files that reference specific virtual environment paths, update them to use the new consolidated environment.

Common files to check:
- `.vscode/settings.json` (VS Code settings)
- `launch.json` (VS Code launch configurations)
- Any batch files or scripts that activate virtual environments

## Step 6: Test Your Application

Test all components of your application to ensure they work with the consolidated environment:

1. Start your backend server(s)
2. Run any scripts or tools
3. Verify all functionality works as expected

## Step 7: Remove Old Virtual Environments

Once you've confirmed everything works, you can remove the old virtual environments:

```bash
# Remove old virtual environments (be careful with these commands!)
rmdir /S /Q venv
rmdir /S /Q butterflyblue_backend\venv
rmdir /S /Q fullstack_project\backend\venv
```

## Troubleshooting

If you encounter package conflicts:

1. Create a more specific requirements file for each component
2. Consider using Docker for components with conflicting dependencies
3. In extreme cases, maintain separate virtual environments but document this clearly

## Benefits of Consolidation

- Reduced disk space usage
- Simplified dependency management
- Easier project maintenance
- Consistent development environment