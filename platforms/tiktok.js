const { getConnection } = require('./tiktokConnection'); // Import the shared connection

let tiktokLiveConnection;

async function initializeTikTok(io, tiktokUsername) {
    tiktokLiveConnection = getConnection();

    if (!tiktokLiveConnection) {
        console.error("TikTok connection is not available.");
        return;
    }

    // Handle TikTok events
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
