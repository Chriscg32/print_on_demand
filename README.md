# Secure Print-on-Demand System Deployment Guide

## Overview
This guide provides detailed instructions for deploying and maintaining the secure print-on-demand system (POD-2024-06-L3). It includes details on setting up TPM and SQLCipher, configuring services, validating compliance, and implementing security protocols.

The system has been enhanced with fully automated deployment scripts and improved UI components that provide better accessibility, mobile responsiveness, and modern design patterns.

## System Architecture

### Directory Structure

```
C:\print_on_demand\
├── architecture.json       # System configuration
├── backend\
│   ├── app\                # Application executables
│   └── instance\           # Database and instance files
├── tools\
│   └── sqlcipher\          # SQLCipher executables
├── ui\                     # UI components
│   ├── pod-components.css        # Base UI components
│   ├── pod-components-enhanced.css # Enhanced UI components
│   ├── components-demo.html      # UI demonstration
│   └── UI_ENHANCEMENTS.md        # UI documentation
└── secure\                 # Secure credentials storage
```

### Security Features

- Encrypted database with AES-256-GCM
- TPM binding for hardware-level security
- Secure service account with minimal permissions
- Firewall rules for API access control

## Prerequisites
- Administrative access to the deployment server (for full deployment)
- PowerShell 5.1 or later
- SQLCipher (installed automatically by deployment scripts)
- Windows 10 or Windows Server 2016+

## Automated Deployment

### Full Deployment (Admin Required)
```powershell
powershell -ExecutionPolicy Bypass -File master_deploy.ps1
```

### Test Deployment (No Admin Required)
```powershell
powershell -ExecutionPolicy Bypass -File deploy_test.ps1
```

### Individual Deployment Components

1. **SQLCipher Installation**
   ```powershell
   powershell -ExecutionPolicy Bypass -File install_sqlcipher.ps1
   ```

2. **Core System Deployment**
   ```powershell
   powershell -ExecutionPolicy Bypass -File enhanced_deploy_fixed.ps1
   ```

3. **UI Component Demonstration**
   Open `C:\print_on_demand\ui\components-demo.html` in a web browser

## Enhanced UI Features

The UI system has been enhanced with the following features:

- **Accessibility Improvements**:
  - Color-blind friendly status indicators
  - Better keyboard navigation
  - High contrast mode support

- **Responsive Design**:
  - Mobile-friendly navigation
  - Adaptive layouts for different screen sizes
  - Touch-optimized interactions

- **Modern UI Patterns**:
  - Skeleton loading states
  - Toast notifications with animations
  - Modern card designs with hover effects
  - Data visualization components

- **Performance Optimizations**:
  - GPU acceleration for animations
  - Reduced motion support
  - Optimized CSS selectors

See `UI_ENHANCEMENTS.md` for detailed documentation.

## Original Deployment Steps (Manual)

### 1. TPM and SQLCipher Integration
Execute the script to configure TPM-bound SQLCipher for database encryption:
```powershell
.\scripts\configure_sqlcipher.ps1
```

### 2. Service Configuration
Set up the cryptographic service account and secure service installation:
```powershell
.\scripts\configure_service.ps1
```

### 3. Compliance Validation
Perform compliance checks for NIST and GDPR alignment:
```powershell
.\scripts\validate_compliance.ps1
```

### 4. Runtime Security Implementation
Apply dynamic CSP nonce generation and security headers:
```powershell
.\scripts\runtime_security_controls.ps1
```

### 5. Deployment Validation
Validate cryptographic integrity, service isolation, and attack surface:
```powershell
.\scripts\deployment_validation_protocol.ps1
```

### 6. Monitoring Activation
Enable real-time security telemetry and compliance reporting:
```powershell
.\scripts\monitoring.ps1
```

### 7. Backup and Recovery
Establish TPM-sealed backup and recovery protocols:
```powershell
.\scripts\rollback_recovery.ps1
```

## Troubleshooting

Common issues and solutions:

1. **Service fails to start**
   - Check service account credentials
   - Verify database permissions
   - Check logs at `C:\logs\`

2. **Database access issues**
   - Verify SQLCipher installation
   - Check encryption key in environment variables
   - Verify TPM functionality

3. **UI rendering problems**
   - Clear browser cache
   - Verify CSS file deployment
   - Check browser compatibility

## Development Setup

### 1. Virtual Environment Setup
Create and activate a virtual environment to isolate dependencies:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\Activate.ps1
# On Linux/Mac:
source venv/bin/activate
```

### 2. Dependency Installation
Install all required dependencies from the requirements file:

```bash
pip install -r requirements.txt
```

### 3. Configuration
Set up the necessary environment variables and configuration files:

```bash
# Copy the example configuration
cp config.example.json config.json

# Edit the configuration with your specific settings
# (Replace with your preferred editor)
notepad config.json
```

### 4. Database Setup
Initialize and migrate the database:

```bash
python manage.py init_db
python manage.py migrate
```

### 5. Running the Application
Start the application in development mode:

```bash
python app.py
```

For production deployment:
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### 6. Testing
Run the test suite to verify functionality:

```bash
pytest
```

For coverage reporting:
```bash
pytest --cov=app tests/
```

### 7. Continuous Integration
The system is configured for CI/CD pipeline integration. See `.github/workflows` for configuration details.

## Support

For support and further information, contact the Print-on-Demand team.

---

© 2025 Print-on-Demand System