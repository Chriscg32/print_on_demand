const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = process.cwd();
const tsconfigPath = path.join(rootDir, 'tsconfig.json');

console.log('🔧 Fixing tsconfig.json');

try {
  if (fs.existsSync(tsconfigPath)) {
    const content = fs.readFileSync(tsconfigPath, 'utf8');
    
    // Check for syntax errors
    try {
      JSON.parse(content);
      console.log('tsconfig.json is valid JSON');
    } catch (jsonError) {
      console.log('❌ Found syntax error in tsconfig.json, fixing...');
      
      // Create a new valid tsconfig.json
      const fixedTsconfig = {
        "compilerOptions": {
          "target": "es5",
          "lib": [
            "dom",
            "dom.iterable",
            "esnext"
          ],
          "allowJs": true,
          "skipLibCheck": true,
          "esModuleInterop": true,
          "allowSyntheticDefaultImports": true,
          "strict": true,
          "forceConsistentCasingInFileNames": true,
          "noFallthroughCasesInSwitch": true,
          "module": "esnext",
          "moduleResolution": "node",
          "resolveJsonModule": true,
          "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
          "incremental": true
        },
        "include": ["pages", "components", "lib", "**/*.ts", "**/*.tsx"],
        "exclude": [
          "node_modules"
        ]
      };
      
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify(fixedTsconfig, null, 2) + '\n'
      );
      console.log('✅ tsconfig.json fixed');
    }
  } else {
    console.log('Creating tsconfig.json...');
    
    const newTsconfig = {
      "compilerOptions": {
        "target": "es5",
        "lib": [
          "dom",
          "dom.iterable",
          "esnext"
        ],
        "allowJs": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "noFallthroughCasesInSwitch": true,
        "module": "esnext",
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "incremental": true
      },
      "include": ["pages", "components", "lib", "**/*.ts", "**/*.tsx"],
      "exclude": [
        "node_modules"
      ]
    };
    
    fs.writeFileSync(
      tsconfigPath,
      JSON.stringify(newTsconfig, null, 2) + '\n'
    );
    console.log('✅ Created tsconfig.json');
  }
} catch (error) {
  console.error(`❌ Error processing tsconfig.json: ${error.message}`);
}
