const tmi = require('tmi.js');
const WebSocket = require('ws');
const dgram = require('dgram');

let twitchClient;
let VnaynWebSocket;
const oscClient = dgram.createSocket('udp4');

const VRCHAT_OSC_PORT = 9000;
const VRCHAT_OSC_HOST = '127.0.0.1';

function initializeTwitch(io, twitchUsername, twitchOauthToken) {
    twitchClient = new tmi.Client({
        options: { debug: true },
        identity: {
            username: twitchUsername,
            password: twitchOauthToken,
        },
        channels: [twitchUsername]
    });

    function connectVnaynWebSocket() {
        VnaynWebSocket = new WebSocket('ws://localhost:21213/vnyan');

        VnaynWebSocket.on('open', () => {
            console.log('Connected to VnaynWebSocket');
        });

        VnaynWebSocket.on('error', (err) => {
            console.error('VnaynWebSocket error');  // Log only the main error message
        });

        VnaynWebSocket.on('close', () => {
            console.log('VnaynWebSocket disconnected, reconnecting in 1 minute...');
            setTimeout(connectVnaynWebSocket, 60000);  // Retry every minute
        });
    }

    // Call the function to initiate the WebSocket connection
    connectVnaynWebSocket();

    twitchClient.connect()
        .then(() => {
            console.log("Connected to Twitch!");
            io.emit('twitchConnected', { status: "Connected to Twitch" });
        })
        .catch(err => console.error("Failed to connect to Twitch:", err));

    twitchClient.on('subscription', (channel, username, method, message, userstate) => {
        console.log(`Twitch ${userstate['display-name']} subscribed!`);
        io.emit('twitchSub', { user: userstate['display-name'] });
    });

    twitchClient.on('message', (channel, tags, message, self) => {
        if (self) return;

        if (message.startsWith('!')) {
            const command = message.slice(1).toLowerCase();
            let response = 'Command not recognized';

            switch (command) {
                case 'hello':
                    response = 'Hello, how are you?';
                    break;
                case 'boop':
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
                case 'wave':
                    sendVRChatOSC('/avatar/parameters/Wave', 1);
                    response = `Waving in VRChat!`;
                    break;
                case 'jump':
                    sendVRChatOSC('/avatar/parameters/Jump', 1);
                    response = `Jumping in VRChat!`;
                    break;
                default:
                    response = `Unknown command: !${command}`;
                    break;
            }

            twitchClient.say(channel, `${tags['display-name']}, ${response}`);
            io.emit('twitchChat', { user: tags['display-name'], message: response });
        } else {
            io.emit('twitchChat', { user: tags['display-name'], message: message });
        }
    });
}

function sendVRChatOSC(address, value) {
    const message = Buffer.from(`${address} ${value}`);
    oscClient.send(message, VRCHAT_OSC_PORT, VRCHAT_OSC_HOST, (err) => {
        if (err) {
            console.error('Failed to send OSC message:', err);
        } else {
            console.log(`OSC message sent: ${address} = ${value}`);
        }
    });
}

function disconnect() {
    if (twitchClient) {
        twitchClient.disconnect();
        console.log("Disconnected from Twitch");
    } else {
        console.error("Twitch client is not initialized");
    }
    oscClient.close();
}

module.exports = (io, twitchUsername, twitchOauthToken) => {
    initializeTwitch(io, twitchUsername, twitchOauthToken);
    return { disconnect };
};
