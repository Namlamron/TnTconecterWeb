require('dotenv').config();  // Load .env file

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { connectToTikTok } = require('./platforms/TikTok/TiktokConnection');  // Import the connection module
const tiktok = require('./platforms/TikTok/Tiktok');  // Regular TikTok connection
const Commands = require('./platforms/Commands');  // TikTok bot module
const TwitchConnection = require('./platforms/Twitch/TwitchConnection');  // Twitch connection
const twitch = require('./platforms/Twitch/Twitch');  // Twitch connection


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Access environment variables using process.env
const tiktokUsername = process.env.TIKTOK_USERNAME;
const twitchUsername = process.env.TWITCH_USERNAME;
const twitchOauthToken = process.env.TWITCH_OAUTH_TOKEN;
const twitchOauthToken2 = process.env.TWITCH_OAUTH_TOKEN2;


// Serve static files
app.use(express.static('public'));

// Initialize connections
connectToTikTok(tiktokUsername);  // This connects to TikTok once
TwitchConnection(io, twitchUsername, twitchOauthToken);  // Twitch connection
// Initialize Bots
TwitchConnection(io, twitchUsername, twitchOauthToken2);  // Twitch connection


// Clean up on exit
process.on('SIGINT', () => {
    console.log('Disconnecting...');
    tiktok(io, tiktokUsername).disconnect();  // Disconnect TikTok
    Commands(io, tiktokUsername).disconnect();  // Disconnect TikTok bot
    twitch.disconnect();  // Disconnect Twitch
    process.exit();
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
