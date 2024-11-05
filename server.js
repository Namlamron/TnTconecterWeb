const { WebcastPushConnection } = require('tiktok-live-connector');
const tmi = require('tmi.js');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

// TikTok Username
let tiktokUsername = "namlamron";

// Twitch configuration
const twitchClient = new tmi.Client({
    options: { debug: true },
    identity: {
        username: 'namlamron',
        password: 'oauth:s0g3k7olhg0r8vqkrt835n9lfq592j' // Obtain at https://twitchapps.com/tmi/
    },
    channels: ['namlamron'] // Replace with the Twitch channel to connect to
});

// Create a TikTok Live connection
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// TikTok Live Connection
tiktokLiveConnection.connect()
    .then(state => {
        console.info(`Connected to TikTok roomId ${state.roomId}`);
        io.emit('status', { message: "Connected to TikTok" });
    })
    .catch(err => {
        console.error('Failed to connect to TikTok', err);
    });

// Connect Twitch client
twitchClient.connect()
    .then(() => {
        console.log("Connected to Twitch!");
        io.emit('twitchConnected', { status: "Connected to Twitch" });
    })
    .catch(err => console.error("Failed to connect to Twitch:", err));

// Handle TikTok events
/*
tiktokLiveConnection.on('member', data => {
    console.log(`${data.uniqueId} joined TikTok stream`);
    io.emit('tiktokMember', data.uniqueId);
});
*/
tiktokLiveConnection.on('chat', data => {
    console.log(`TikTok ${data.uniqueId} says: ${data.comment}`);
    io.emit('tiktokChat', { user: data.uniqueId, message: data.comment });
});

tiktokLiveConnection.on('gift', data => {
    console.log(`TikTok ${data.uniqueId} sent a gift: ${data.giftName} (x${data.repeatCount})`);
    io.emit('tiktokGift', { user: data.uniqueId, gift: data.giftName, count: data.repeatCount });
});

// Handle TikTok follows
tiktokLiveConnection.on('follow', data => {
    console.log(`TikTok ${data.uniqueId} followed!`);
    io.emit('tiktokFollow', { user: data.uniqueId });
});

// Handle Twitch events
twitchClient.on('message', (channel, tags, message, self) => {
    if (self) return; // Ignore echoed messages

    console.log(`Twitch ${tags['display-name']}: ${message}`);
    io.emit('twitchChat', { user: tags['display-name'], message: message });
});

twitchClient.on('subscription', (channel, username, method, message, userstate) => {
    console.log(`Twitch ${username} subscribed!`);
    io.emit('twitchSub', { user: username });
});

// Clean up on exit
process.on('SIGINT', () => {
    console.log('Disconnecting...');
    tiktokLiveConnection.disconnect();
    twitchClient.disconnect();
    process.exit();
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
