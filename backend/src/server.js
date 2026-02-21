require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

console.log('🚀 Starting server...');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

console.log('✅ Node.js version check passed');

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

console.log('✅ Environment variables loaded');
console.log('📊 DATABASE URL:', process.env.DATABASE ? 'Set' : 'NOT SET');
console.log('🔌 PORT:', process.env.PORT || 8889);

mongoose.connect(process.env.DATABASE);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connection.on('error', (error) => {
  console.log(
    `1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`
  );
  console.error(`2. 🚫 Error → : ${error.message}`);
});

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connected successfully');
});

console.log('📚 Loading models...');
const modelsFiles = globSync('./src/models/**/*.js');

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}
console.log(`✅ ${modelsFiles.length} models loaded`);

console.log('🚀 Starting Express app...');
// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 8889);
const server = app.listen(app.get('port'), '0.0.0.0', () => {
  console.log(`✅ Express running → On PORT : ${server.address().port}`);
});
