const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const tiktok = require('./platforms/tiktok');  // Import the TikTok module
const twitch = require('./platforms/twitch');  // Import the Twitch module

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

// Initialize TikTok and Twitch connections
tiktok(io);  // Pass the `io` instance to TikTok
twitch(io);  // Pass the `io` instance to Twitch

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
