const tmi = require('tmi.js');

// Twitch configuration
const twitchClient = new tmi.Client({
    options: { debug: true },
    identity: {
        username: 'namlamron',
        password: 'oauth:s0g3k7olhg0r8vqkrt835n9lfq592j' // Obtain at https://twitchapps.com/tmi/
    },
    channels: ['namlamron'] // Replace with the Twitch channel to connect to
});

function initializeTwitch(io) {
    // Connect Twitch client
    twitchClient.connect()
        .then(() => {
            console.log("Connected to Twitch!");
            io.emit('twitchConnected', { status: "Connected to Twitch" });
        })
        .catch(err => console.error("Failed to connect to Twitch:", err));

    // Handle Twitch chat messages
    twitchClient.on('message', (channel, tags, message, self) => {
        if (self) return; // Ignore echoed messages

        console.log(`Twitch ${tags['display-name']}: ${message}`);
        io.emit('twitchChat', { user: tags['display-name'], message: message });
    });

    // Handle Twitch subscriptions
    twitchClient.on('subscription', (channel, username, method, message, userstate) => {
        console.log(`Twitch ${userstate['display-name']} subscribed!`);
        io.emit('twitchSub', { user: userstate['display-name'] });
    });
}

// Disconnect function to clean up on exit
function disconnect() {
    twitchClient.disconnect();
}

module.exports = (io) => {
    initializeTwitch(io);
    return { disconnect };
};
