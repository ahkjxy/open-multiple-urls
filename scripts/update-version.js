import fs from 'fs';
import { VERSION } from '../modules/version.js';

// 更新 manifest.json
const manifestPath = './manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = VERSION;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// 更新 package.json
const packagePath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.version = VERSION;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2)); 