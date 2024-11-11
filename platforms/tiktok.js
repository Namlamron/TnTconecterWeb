const { WebcastPushConnection } = require('tiktok-live-connector');

let tiktokLiveConnection;
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

    // Handle TikTok events with error handling for each event listener
    tiktokLiveConnection.on('chat', data => {
        try {
            console.log(`TikTok ${data.nickname} says: ${data.comment}`);
            io.emit('tiktokChat', { user: data.nickname, message: data.comment });
        } catch (err) {
            console.error("Error in chat event handler:", err);
        }
    });

    tiktokLiveConnection.on('gift', data => {
        try {
            console.log(`TikTok ${data.nickname} sent a gift: ${data.giftName} (x${data.repeatCount})`);
            io.emit('tiktokGift', { user: data.nickname, gift: data.giftName, count: data.repeatCount });
        } catch (err) {
            console.error("Error in gift event handler:", err);
        }
    });

    tiktokLiveConnection.on('follow', data => {
        try {
            console.log(`TikTok ${data.nickname} followed!`);
            io.emit('tiktokFollow', { user: data.nickname });
        } catch (err) {
            console.error("Error in follow event handler:", err);
        }
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
}

module.exports = (io, tiktokUsername) => {
    initializeTikTok(io, tiktokUsername);
    return { disconnect };
};
