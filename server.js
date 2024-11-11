require('dotenv').config();  // Load .env file

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { connectToTikTok } = require('./platforms/TiktokConnection');  // Import the connection module
const tiktok = require('./platforms/Tiktok');  // Regular TikTok connection
const TiktokCommands = require('./platforms/TiktokCommands');  // TikTok bot module
const twitch = require('./platforms/Twitch');  // Twitch connection

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Access environment variables using process.env
const tiktokUsername = process.env.TIKTOK_USERNAME;
const twitchUsername = process.env.TWITCH_USERNAME;
const twitchOauthToken = process.env.TWITCH_OAUTH_TOKEN;

// Serve static files
app.use(express.static('public'));

// Initialize TikTok connection
connectToTikTok(tiktokUsername);  // This connects to TikTok once

// Initialize TikTok and TikTok Bot connections
tiktok(io, tiktokUsername);  // Regular TikTok connection
TiktokCommands(io, tiktokUsername);  // TikTok bot functionality
twitch(io, twitchUsername, twitchOauthToken);  // Twitch connection

// Clean up on exit
process.on('SIGINT', () => {
    console.log('Disconnecting...');
    tiktok(io, tiktokUsername).disconnect();  // Disconnect TikTok
    TiktokCommands(io, tiktokUsername).disconnect();  // Disconnect TikTok bot
    twitch.disconnect();  // Disconnect Twitch
    process.exit();
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
