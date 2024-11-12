const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws'); // Import WebSocket for vnayn

let tiktokLiveConnection;
let vnaynSocket;
let isConnecting = false; // Flag to prevent multiple connection attempts

async function initializeTikTok(io, tiktokUsername) {
    tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

    async function connectToTikTok() {
        if (isConnecting) {
            console.info("Connection attempt already in progress. Skipping...");
            return;
        }

        isConnecting = true; // Set the flag to indicate we're attempting a connection

        try {
            // Remove all previous listeners to avoid duplication
            tiktokLiveConnection.removeAllListeners();

            const state = await tiktokLiveConnection.connect();
            console.info(`Connected to TikTok roomId ${state.roomId}`);
            io.emit('status', { message: "Connected to TikTok" });
        } catch (err) {
            console.error('Failed to connect to TikTok', err);
            setTimeout(connectToTikTok, 30000); // Retry after 30 seconds if initial connection fails
        } finally {
            isConnecting = false; // Reset the flag after attempt
        }
    }

    // Initial connection
    connectToTikTok();

    // Recursive reconnect function to reset connection every 20 minutes
    async function scheduleReconnect() {
        console.info("Resetting TikTok connection...");
        try {
            await tiktokLiveConnection.disconnect();
            await connectToTikTok(); // Wait until reconnect is successful
        } catch (err) {
            console.error("Failed to reset TikTok connection:", err);
            setTimeout(scheduleReconnect, 30000); // Retry after 30 seconds if reset fails
            return;
        }
        setTimeout(scheduleReconnect, 1200000); // Schedule the next reset in 20 minutes
    }
    
    // Start the reconnect loop
    scheduleReconnect();

    // Initialize vnayn WebSocket connection
   // initializeVnaynConnection();

    // Handle TikTok chat messages and commands
    tiktokLiveConnection.on('chat', data => {
        try {
            const message = data.comment;
            const username = data.nickname;
            console.log(`TikTok ${username} says: ${message}`);
            io.emit('tiktokChat', { user: username, message });

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
                        // Send "Boop" message to WebSocket
                        if (vnaynSocket && vnaynSocket.readyState === WebSocket.OPEN)
                        vnaynSocket.send('Boop');
                        break;
                    default:
                        response = `Unknown command: !${command}`;
                        break;
                }

                // Respond to the command in chat and send to the frontend
                io.emit('tiktokChat', { user: username, message: response });
                console.log(`Responding to ${username} with: ${response}`);
            }
        } catch (err) {
            console.error("Error in chat event handler:", err);
        }
    });
}

// Initialize vnayn WebSocket connection
function initializeVnaynConnection() {
    vnaynSocket = new WebSocket('ws://localhost:21213/vnyan'); // Connect to vnayn

    vnaynSocket.on('open', () => {
        console.info("Connected to vnayn WebSocket server.");
    });

    vnaynSocket.on('close', () => {
        console.warn("Disconnected from vnayn WebSocket server. Reconnecting in 30 seconds...");
        setTimeout(initializeVnaynConnection, 30000); // Reconnect after 30 seconds if disconnected
    });

    vnaynSocket.on('error', (err) => {
        console.error("Error with vnayn WebSocket:", err);
    });
}

// Disconnect function to clean up on exit
async function disconnect() {
    if (tiktokLiveConnection) {
        try {
            await tiktokLiveConnection.disconnect();
            console.info("Disconnected from TikTok.");
        } catch (err) {
            console.error("Failed to disconnect TikTok:", err);
        }
    }

    if (vnaynSocket) {
        vnaynSocket.close();
        console.info("Disconnected from vnayn WebSocket.");
    }
}

module.exports = (io, tiktokUsername) => {
    initializeTikTok(io, tiktokUsername);
    return { disconnect };
};
