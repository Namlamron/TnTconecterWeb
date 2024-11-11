// TwitchConnection.js
const tmi = require('tmi.js');
let twitchClient;

function initializeTwitch(io, twitchUsername, twitchOauthToken) {
    if (twitchClient) {
        console.log("Twitch client is already initialized.");
        return twitchClient; // Return the existing client if already initialized
    }

    twitchClient = new tmi.Client({
        options: { debug: true },
        identity: {
            username: twitchUsername,
            password: twitchOauthToken,  // Use OAuth token from .env
        },
        channels: [twitchUsername]
    });

    twitchClient.connect()
        .then(() => {
            console.log("Connected to Twitch!");
            io.emit('twitchConnected', { status: "Connected to Twitch" });
        })
        .catch(err => console.error("Failed to connect to Twitch:", err));

    return twitchClient;
}

function disconnect() {
    if (twitchClient) {
        twitchClient.disconnect();
        console.log("Disconnected from Twitch.");
    }
}

module.exports = (io, twitchUsername, twitchOauthToken) => {
    return { 
        twitchClient: initializeTwitch(io, twitchUsername, twitchOauthToken), 
        disconnect 
    };
};
