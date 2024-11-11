const tmi = require('tmi.js');

// Define some sample commands
const commands = {
    '!hello': 'Hello, how are you?',
    '!uptime': 'The stream has been live for 3 hours.', // Replace with actual logic to get stream uptime
    '!commands': 'Available commands: !hello, !uptime'
};

function initializeTwitch(io, twitchUsername, twitchOauthToken) {
    const twitchClient = new tmi.Client({
        options: { debug: true },
        identity: {
            username: twitchUsername,
            password: twitchOauthToken,  // Use OAuth token from .env
        },
        channels: [twitchUsername]
    });

    // Connect Twitch client
    twitchClient.connect()
        .then(() => {
            console.log("Connected to Twitch!");
            io.emit('twitchConnected', { status: "Connected to Twitch" });
        })
        .catch(err => console.error("Failed to connect to Twitch:", err));

    // Handle Twitch subscriptions
    twitchClient.on('subscription', (channel, username, method, message, userstate) => {
        console.log(`Twitch ${userstate['display-name']} subscribed!`);
        io.emit('twitchSub', { user: userstate['display-name'] });
    });

    // Handle Twitch chat messages and commands
    twitchClient.on('message', (channel, tags, message, self) => {
        if (self) return; // Ignore echoed messages

        // Check if the message starts with a command (e.g., !hello)
        if (message.startsWith('!')) {
            const command = message.toLowerCase();
            if (commands[command]) {
                // Respond to the command
                twitchClient.say(channel, `${tags['display-name']}, ${commands[command]}`);
                io.emit('twitchChat', { user: tags['display-name'], message: commands[command] });
            } else {
                // Command not found
                console.log("Command not found");
            }
        } else {
            // Regular chat message
            io.emit('twitchChat', { user: tags['display-name'], message: message });
        }
    });
}

// Disconnect function to clean up on exit
function disconnect() {
    twitchClient.disconnect();
}

module.exports = (io, twitchUsername, twitchOauthToken) => {
    initializeTwitch(io, twitchUsername, twitchOauthToken);
    return { disconnect };
};
