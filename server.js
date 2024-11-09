require('dotenv').config();  // Load .env file

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const tiktok = require('./platforms/tiktok');  // Corrected path
const twitch = require('./platforms/twitch');  // Corrected path

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

console.log("Twitch OAuth Token:", process.env.TWITCH_OAUTH_TOKEN);

// Access environment variables using process.env
const tiktokUsername = process.env.TIKTOK_USERNAME;
const twitchUsername = process.env.TWITCH_USERNAME;
const twitchOauthToken = process.env.TWITCH_OAUTH_TOKEN;

// Serve static files
app.use(express.static('public'));

// Initialize TikTok and Twitch connections
tiktok(io, tiktokUsername);  // Pass the TikTok username
twitch(io, twitchUsername, twitchOauthToken);  // Pass the Twitch username and OAuth token

// Clean up on exit
process.on('SIGINT', () => {
    console.log('Disconnecting...');
    tiktok.disconnect();
    twitch.disconnect();
    process.exit();
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
