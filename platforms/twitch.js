const tmi = require('tmi.js');
const WebSocket = require('ws');  // Import the WebSocket library

let twitchClient;  // Declare globally for use in disconnect
let VnaynWebSocket;  // Declare VnaynWebSocket

function initializeTwitch(io, twitchUsername, twitchOauthToken) {
    twitchClient = new tmi.Client({
        options: { debug: true },
        identity: {
            username: twitchUsername,
            password: twitchOauthToken,  // Use OAuth token from .env
        },
        channels: [twitchUsername]
    });

    // Create WebSocket connection to ws://localhost:21213/vnyan
    VnaynWebSocket = new WebSocket('ws://localhost:21213/vnyan');

    VnaynWebSocket.on('open', () => {
        console.log('Connected to VnaynWebSocket');
    });

    VnaynWebSocket.on('error', (err) => {
        console.error('VnaynWebSocket error:', err);
    });

    // Reconnect WebSocket if connection is lost
    VnaynWebSocket.on('close', () => {
        console.log('VnaynWebSocket disconnected, reconnecting...');
        setTimeout(() => {
            VnaynWebSocket = new WebSocket('ws://localhost:21213/vnyan'); // Reconnect
        }, 5000); // Retry every 5 seconds
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

        // Check if the message starts with a '!'
        if (message.startsWith('!')) {
            const command = message.slice(1).toLowerCase(); // Remove the '!' and convert to lowercase
            let response = 'Command not recognized'; // Default response

            // Handle known commands
            switch (command) {
                case 'hello':
                    response = 'Hello, how are you?';
                    break;
                case 'boop':
                    // Ensure WebSocket is open before sending the message
                    if (VnaynWebSocket.readyState === WebSocket.OPEN) {
                        VnaynWebSocket.send("boop");
                        console.log("Sent 'boop' command to VnaynWebSocket");
                    } else {
                        console.error('WebSocket is not open. Message not sent.');
                    }
                    response = `HI how dwad`;
                    break;
                case 'meme':
                    if (VnaynWebSocket.readyState === WebSocket.OPEN) {
                        VnaynWebSocket.send(message);
                        console.log(`Sent 'meme' command to VnaynWebSocket: ${message}`);
                    } else {
                        console.error('WebSocket is not open. Message not sent.');
                    }
                    response = `HI how dwad`;
                    break;
                default:
                    response = `Unknown command: !${command}`;
                    break;
            }

            // Respond to the command
            twitchClient.say(channel, `${tags['display-name']}, ${response}`);
            io.emit('twitchChat', { user: tags['display-name'], message: response });
        } else {
            // Regular chat message
            io.emit('twitchChat', { user: tags['display-name'], message: message });
        }
    });
}

// Disconnect function to clean up on exit
function disconnect() {
    if (twitchClient) {
        twitchClient.disconnect();
        console.log("Disconnected from Twitch");
    } else {
        console.error("Twitch client is not initialized");
    }
}

module.exports = (io, twitchUsername, twitchOauthToken) => {
    initializeTwitch(io, twitchUsername, twitchOauthToken);
    return { disconnect };
};
