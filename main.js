// main.js — run both bot and web server together

const { spawn } = require('child_process');

// Start the Telegram bot
const bot = spawn('node', ['index.js'], { stdio: 'inherit' });

// Start the web server
const web = spawn('node', ['server.js'], { stdio: 'inherit' });

// Handle shutdown properly
process.on('SIGINT', () => {
  bot.kill('SIGINT');
  web.kill('SIGINT');
  process.exit();
});
