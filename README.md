# Print-on-Demand Application

A React-based web application for selecting and publishing print-on-demand designs from Printify to Shopify. This platform enables users to efficiently manage their print-on-demand business with a secure, responsive interface.

![Print-on-Demand Banner](https://example.com/pod-banner.jpg)

## Features

- **Design Management**:
  - Browse trending designs from Printify
  - Select multiple designs for publishing
  - Preview designs before publishing
  - Publish selected designs to Shopify with one click

- **Security**:
  - Encrypted database with AES-256-GCM
  - TPM binding for hardware-level security
  - Secure service account with minimal permissions
  - Firewall rules for API access control

- **User Interface**:
  - Responsive design for desktop and mobile
  - Accessibility-compliant UI components
  - Modern UI patterns with animations
  - Data visualization components

- **Performance**:
  - GPU acceleration for animations
  - Reduced motion support
  - Optimized CSS selectors

## System Architecture

### Directory Structure

```
print-on-demand/
├── public/                  # Static files
├── src/
│   ├── apis/                # API integration modules
│   │   ├── Printify.js      # Printify API integration
│   │   ├── Shopify.js       # Shopify API integration
│   │   └── Marketing.js     # Marketing API integration
│   ├── components/          # React components
│   │   ├── Button.jsx       # Reusable button component
│   │   ├── DesignCard.jsx   # Design card component
│   │   ├── DesignSelector.jsx # Main design selection component
│   │   └── Navigation.jsx   # Navigation component
│   ├── styles/              # Styling
│   │   └── theme.js         # Theme configuration
│   ├── integration-tests/   # Integration tests
│   ├── App.jsx              # Main App component
│   └── index.js             # Entry point
├── backend/                 # Backend services
│   ├── app/                 # Application executables
│   └── instance/            # Database and instance files
├── tools/                   # Utility tools
│   └── sqlcipher/           # SQLCipher executables
├── ui/                      # UI components library
│   ├── pod-components.css        # Base UI components
│   ├── pod-components-enhanced.css # Enhanced UI components
│   ├── components-demo.html      # UI demonstration
│   └── UI_ENHANCEMENTS.md        # UI documentation
├── scripts/                 # Build and deployment scripts
├── docs/                    # Documentation
├── tests/                   # Unit and E2E tests
└── secure/                  # Secure credentials storage
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Printify API key
- Shopify API credentials
- For backend deployment:
  - Administrative access to the deployment server (for full deployment)
  - PowerShell 5.1 or later
  - Windows 10 or Windows Server 2016+

## Getting Started

### Frontend Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/print-on-demand.git
   cd print-on-demand
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_PRINTIFY_API_URL=https://api.printify.com/v1
   REACT_APP_PRINTIFY_API_KEY=your_printify_api_key
   REACT_APP_SHOPIFY_API_URL=https://your-store.myshopify.com/admin/api/2023-04
   REACT_APP_SHOPIFY_API_KEY=your_shopify_api_key
   REACT_APP_SHOPIFY_API_PASSWORD=your_shopify_api_password
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Backend Deployment

#### Automated Deployment (Recommended)

##### Full Deployment (Admin Required)

```powershell
powershell -ExecutionPolicy Bypass -File master_deploy.ps1
```

##### Test Deployment (No Admin Required)

```powershell
powershell -ExecutionPolicy Bypass -File deploy_test.ps1
```

#### Individual Deployment Components

1. **SQLCipher Installation**
   ```powershell
   powershell -ExecutionPolicy Bypass -File install_sqlcipher.ps1
   ```

2. **Core System Deployment**
   ```powershell
   powershell -ExecutionPolicy Bypass -File enhanced_deploy_fixed.ps1
   ```

3. **UI Component Demonstration**
   Open `ui/components-demo.html` in a web browser

## Development

### Available Scripts

- `npm start` - Start the development server
- `npm test` - Run all tests
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check code quality
- `npm run deploy:prod` - Deploy to production (requires proper configuration)
- `npm run analyze` - Analyze the bundle size

### Backend Development Setup

1. **Virtual Environment Setup**
   ```bash
   # Create a virtual environment
   python -m venv venv

   # Activate the virtual environment
   # On Windows:
   .\venv\Scripts\Activate.ps1
   # On Linux/Mac:
   source venv/bin/activate
   ```

2. **Dependency Installation**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configuration**
   ```bash
   # Copy the example configuration
   cp config.example.json config.json

   # Edit the configuration with your specific settings
   # (Replace with your preferred editor)
   notepad config.json
   ```

4. **Database Setup**
   ```bash
   python manage.py init_db
   python manage.py migrate
   ```

5. **Running the Backend**
   ```bash
   python app.py
   ```

## Testing

### Frontend Tests

- **Unit Tests**

  ```bash
  npm test
  ```

- **Integration Tests**

  ```bash
  npm run test:integration
  ```

- **End-to-End Tests**

  ```bash
  npm run test:e2e
  ```

### Backend Tests

- **Run Tests**

  ```bash
  pytest
  ```

- **Coverage Reporting**

  ```bash
  pytest --cov=app tests/
  ```

## Component Documentation

### DesignSelector

The main component for selecting and publishing designs. It displays a grid of designs fetched from Printify and allows users to select designs for publishing to Shopify.

```jsx
<DesignSelector maxDesignsToShow={20} />
```

### DesignCard

Displays a single design with its image, title, and description. Allows users to select/deselect the design.

```jsx
<DesignCard 
  design={designObject} 
  isSelected={boolean} 
  onSelect={handleSelectFunction} 
/>
```

### Navigation

The main navigation component with responsive design.

```jsx
<Navigation 
  items={navigationItems} 
  logoText="Print On Demand" 
/>
```

## Troubleshooting

### Frontend Issues

1. **API Connection Problems**

   - Check API keys in .env file
   - Verify network connectivity
   - Check browser console for errors

2. **UI Rendering Issues**

   - Clear browser cache
   - Check for JavaScript errors
   - Verify CSS compatibility

### Backend Issues

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

## Deployment

### Deployment Checklist

Before deploying, make sure to go through the [deployment checklist](docs/deployment-checklist.md).

### Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the backend using the automated scripts:
   ```powershell
   powershell -ExecutionPolicy Bypass -File master_deploy.ps1
   ```

3. Configure your web server to serve the static frontend files and proxy API requests to the backend.

### Deployment to Vercel (Free Tier)

This application is optimized for deployment on Vercel's free tier plan.

#### Automatic Deployment

1. Fork this repository to your GitHub account.

2. Sign up for a [Vercel account](https://vercel.com/signup) if you don't have one.

3. Create a new project in Vercel and import your GitHub repository.

4. Configure the environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to the "Environment Variables" tab
   - Add all the variables from your `.env` file

5. Deploy the project. Vercel will automatically build and deploy your application.

#### Manual Deployment

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

#### Optimizing for Free Tier

The application includes several optimizations for Vercel's free tier:

1. **Caching Strategy**: The `vercel.json` file configures aggressive caching for static assets to reduce bandwidth usage.

2. **Image Optimization**: Images are optimized during the build process to reduce size.

3. **Code Splitting**: React components are lazy-loaded to reduce initial bundle size.

4. **Mock Data**: In development mode, the application uses mock data to avoid API rate limits.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Features

- **Database Encryption**: AES-256-GCM encryption via SQLCipher
- **Hardware Security**: TPM binding for key protection
- **Access Control**: Minimal-permission service accounts and firewall rules
- **Runtime Protection**: CSP nonce generation and security headers
- **Compliance**: NIST and GDPR alignment

## Support

For support and further information, contact the Print-on-Demand team at support@printify-pod.com.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Printify](https://printify.com/) for their print-on-demand platform
- [Shopify](https://shopify.com/) for their e-commerce platform
- [React](https://reactjs.org/) for the UI library

---

© 2025 Print-on-Demand System
