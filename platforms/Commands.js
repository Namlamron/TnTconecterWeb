const WebSocket = require('ws'); // Import WebSocket library
const tmi = require('tmi.js'); // Import tmi.js for Twitch integration

let vnyanWebSocket;
let twitchClient; // Declare the Twitch client

// Function to initialize Twitch bot
function initializeTwitch(io, twitchUsername, twitchOauthToken) {
    // Set up your Twitch bot configuration
    const opts = {
      identity: {
        username: 'Namlamron', // Use the provided username
        password: 'oauth:t8p3n8wn1akr744zeo495115c1btyc', // Use the provided OAuth token
      },
      channels: [
        'Namlamron', // Join the channel with the provided username
      ],
    };
    
    // Create a client instance
    twitchClient = new tmi.Client(opts); // Assign to global twitchClient
    
    // Event listener for when the bot connects
    twitchClient.on('connected', (addr, port) => {
      console.log(`* Connected to ${addr}:${port}`);
    });
    
    // Event listener for new messages in chat
    twitchClient.on('message', (channel, tags, message, self) => {
      if (self) return; // Ignore messages from the bot itself
    
      console.log(`${tags['display-name']}: ${message}`);
    
      // Example: Respond to a command
      if (message.toLowerCase() === '!hello') {
        twitchClient.say(channel, `Hello, ${tags['display-name']}!`);
      }
      if (message.toLowerCase() === '!boop') {
        twitchClient.say(channel, `Get booped, ${tags['display-name']}!`);
      }
    });
    
    // Connect to Twitch
    twitchClient.connect();
}

// Function to initialize vnyan WebSocket connection
function initializeVnyanWebSocket() {
    vnyanWebSocket = new WebSocket('ws://localhost:21213/vnyan');

    vnyanWebSocket.on('open', () => {
        console.log('Connected to vnyan WebSocket server.');
    });

    vnyanWebSocket.on('error', (error) => {
        console.error('Failed to connect to vnyan WebSocket server:', error);
    });

    vnyanWebSocket.on('close', () => {
        console.log('Disconnected from vnyan WebSocket server.');
    });
}

// Disconnect function to clean up on exit
async function disconnect() {
    if (twitchClient) {
        try {
            await twitchClient.disconnect();
            console.info("Disconnected from Twitch.");
        } catch (err) {
            console.error("Failed to disconnect Twitch:", err);
        }
    }

    if (vnyanWebSocket && vnyanWebSocket.readyState === WebSocket.OPEN) {
        vnyanWebSocket.close();
        console.info("Disconnected from vnyan WebSocket server.");
    }
}

module.exports = (io, twitchUsername, twitchOauthToken) => {
    initializeTwitch(io, twitchUsername, twitchOauthToken);
    initializeVnyanWebSocket();
    return { disconnect };
};
