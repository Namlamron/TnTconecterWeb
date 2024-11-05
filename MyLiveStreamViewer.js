const { WebcastPushConnection } = require('tiktok-live-connector');
const tmi = require('tmi.js');

// TikTok Username
let tiktokUsername = "jayfox_99";

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
    })
    .catch(err => {
        console.error('Failed to connect to TikTok', err);
    });

// Connect Twitch client
twitchClient.connect()
    .then(() => {
        console.log("Connected to Twitch!");
    })
    .catch(err => console.error("Failed to connect to Twitch:", err));

// Handle TikTok events
tiktokLiveConnection.on('member', data => {
    console.log(`${data.uniqueId} joined TikTok stream`);
});

tiktokLiveConnection.on('chat', data => {
    console.log(`TikTok ${data.uniqueId} says: ${data.comment}`);
});

tiktokLiveConnection.on('gift', data => {
    console.log(`TikTok ${data.uniqueId} sent a gift: ${data.giftName} (x${data.repeatCount})`);
});

// Handle Twitch events
twitchClient.on('message', (channel, tags, message, self) => {
    if (self) return; // Ignore echoed messages
    console.log(`Twitch ${tags['display-name']}: ${message}`);
});

twitchClient.on('subscription', (channel, username, method, message, userstate) => {
    console.log(`Twitch ${username} subscribed!`);
});

// Handle errors
tiktokLiveConnection.on('error', err => {
    console.error('TikTok connection error!', err);
});

twitchClient.on('disconnected', (reason) => {
    console.error('Twitch disconnected:', reason);
});

// Clean up on exit
process.on('SIGINT', () => {
    console.log('Disconnecting...');
    tiktokLiveConnection.disconnect();
    twitchClient.disconnect();
    process.exit();
});
