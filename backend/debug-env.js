const path = require('path');

console.log('=== Environment Debug ===');
console.log('Current directory:', __dirname);
console.log('Looking for .env at:', path.join(__dirname, '.env'));

// Try different loading methods
console.log('\n1. Testing default dotenv loading...');
require('dotenv').config();
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'LOADED ✅' : 'MISSING ❌');

console.log('\n2. Testing explicit path loading...');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'LOADED ✅' : 'MISSING ❌');

console.log('\n3. Testing with debug flag...');
require('dotenv').config({ debug: true });
