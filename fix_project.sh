# 1. Fix Python dependency conflicts in requirements.txt
sed -i 's/botocore==1.37.4/botocore==1.37.16/g' requirements.txt
sed -i 's/filelock==3.18.0/filelock==3.17.0/g' requirements.txt
sed -i 's/s3transfer==0.11.4/s3transfer==0.11.3/g' requirements.txt
sed -i 's/virtualenv==20.29.2/virtualenv==20.29.3/g' requirements.txt

# 2. Create valid package.json
cat > package.json <<EOF
{
  "name": "print_on_demand",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^4.5.9"
  }
}
EOF

# 3. Verify JSON syntax
node -e "JSON.parse(require('fs').readFileSync('package.json'))"

# 4. Create proper project structure
mkdir -p src
touch src/App.css
echo "/* Add your styles here */" > src/App.css

# 5. Create core React files
cat > src/main.jsx <<EOF
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

cat > src/App.jsx <<EOF
import React from 'react'

export default function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}
EOF

# 6. Create vite.config.js
cat > vite.config.js <<EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
EOF

# 7. Create vercel.json
cat > vercel.json <<EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [{ "src": "/.*", "dest": "/index.html" }]
}
EOF

# 8. Clean environment
rm -rf node_modules package-lock.json new_venv

# 9. Install npm dependencies
npm install

# 10. Set up Python environment
python -m venv new_venv
source new_venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 11. Build and deploy
npm run build
vercel deploy --prod