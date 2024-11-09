const { WebcastPushConnection } = require('tiktok-live-connector');

let tiktokLiveConnection; // Move this outside to make it accessible in both initializeTikTok and disconnect

async function initializeTikTok(io, tiktokUsername) {
    tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

    // Function to initialize and manage the TikTok connection
    async function connectToTikTok() {
        try {
            const state = await tiktokLiveConnection.connect();
            console.info(`Connected to TikTok roomId ${state.roomId}`);
            io.emit('status', { message: "Connected to TikTok" });
        } catch (err) {
            console.error('Failed to connect to TikTok', err);
            setTimeout(connectToTikTok, 30000);  // Retry after 30 seconds if initial connection fails
        }
    }

    // Initial connection
    connectToTikTok();

    // Reset connection every 20 minutes
    setInterval(async () => {
        console.info("Resetting TikTok connection...");
        try {
            await tiktokLiveConnection.disconnect();
            connectToTikTok();
        } catch (err) {
            console.error("Failed to reset TikTok connection:", err);
            setTimeout(connectToTikTok, 30000);  // Retry after 30 seconds if disconnection fails
        }
    }, 1200000); // 20 minutes in milliseconds

    // Handle TikTok events
    tiktokLiveConnection.on('chat', data => {
        console.log(`TikTok ${data.nickname} says: ${data.comment}`);
        io.emit('tiktokChat', { user: data.nickname, message: data.comment });
    });

    tiktokLiveConnection.on('gift', data => {
        console.log(`TikTok ${data.nickname} sent a gift: ${data.giftName} (x${data.repeatCount})`);
        io.emit('tiktokGift', { user: data.nickname, gift: data.giftName, count: data.repeatCount });
    });

    tiktokLiveConnection.on('follow', data => {
        console.log(`TikTok ${data.nickname} followed!`);
        io.emit('tiktokFollow', { user: data.nickname });
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
