// tiktokConnection.js
const { WebcastPushConnection } = require('tiktok-live-connector');

let tiktokLiveConnection;
let isConnected = false;
let isConnecting = false;

async function connectToTikTok(tiktokUsername) {
    if (isConnecting) {
        console.info("Connection attempt already in progress. Skipping...");
        return;
    }

    if (isConnected) {
        console.info("Already connected to TikTok.");
        return;
    }

    isConnecting = true; // Set the flag to indicate we're attempting a connection

    try {
        tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);
        const state = await tiktokLiveConnection.connect();
        console.info(`Connected to TikTok roomId ${state.roomId}`);
        isConnected = true;
    } catch (err) {
        console.error('Failed to connect to TikTok', err);
        setTimeout(() => connectToTikTok(tiktokUsername), 30000); // Retry after 30 seconds
    } finally {
        isConnecting = false; // Reset the flag after attempt
    }
}

// Function to disconnect TikTok
async function disconnect() {
    if (tiktokLiveConnection) {
        try {
            await tiktokLiveConnection.disconnect();
            isConnected = false;
            console.info("Disconnected from TikTok.");
        } catch (err) {
            console.error("Failed to disconnect TikTok:", err);
        }
    }
}

// Export the connection functions
module.exports = {
    connectToTikTok,
    disconnect,
    getConnection: () => tiktokLiveConnection,
};
