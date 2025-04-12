// build.js - Custom build script for Vercel
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the build commands
console.log('Building client...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('Building server...');
execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

// Prepare for Vercel deployment
console.log('Preparing for Vercel deployment...');

// Copy the Vercel-specific package.json
if (fs.existsSync(path.join(__dirname, 'vercel.package.json'))) {
  console.log('Copying Vercel package.json...');
  fs.copyFileSync(
    path.join(__dirname, 'vercel.package.json'),
    path.join(__dirname, '.vercel/package.json')
  );
}

console.log('Build completed successfully!');
