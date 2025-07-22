#!/usr/bin/env node

/**
 * Medical Report Organizer Setup Script
 * Run this after npm install to complete project setup
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 Setting up Medical Report Organizer...\n');

// Check if .env exists, if not copy from .env.example
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
    console.log('⚠️  Please update .env with your actual API keys\n');
  }
}

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('✅ Created assets directory');
}

// Check required dependencies
const packageJson = require('./package.json');
const requiredDeps = [
  'expo',
  'react',
  'react-native',
  '@react-navigation/native',
  'expo-sqlite'
];

console.log('📦 Checking dependencies...');
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
  console.log('❌ Missing dependencies:', missingDeps.join(', '));
  console.log('   Run: npm install');
} else {
  console.log('✅ All required dependencies are installed');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update .env file with your API keys');
console.log('2. Run: npm start');
console.log('3. Use Expo Go app to scan QR code');
console.log('\n📚 See README.md for detailed documentation');
console.log('🤝 Built with VibeCoding x Trae\n');
