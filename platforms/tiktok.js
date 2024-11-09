const { WebcastPushConnection } = require('tiktok-live-connector');

// TikTok Username
let tiktokUsername = "namlamron";

// Create a TikTok Live connection
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// Function to initialize and manage the TikTok connection
function initializeTikTok(io) {
    function connectToTikTok() {
        tiktokLiveConnection.connect()
            .then(state => {
                console.info(`Connected to TikTok roomId ${state.roomId}`);
                io.emit('status', { message: "Connected to TikTok" });
            })
            .catch(err => {
                console.error('Failed to connect to TikTok', err);
                setTimeout(connectToTikTok, 30000);  // Retry after 30 seconds if initial connection fails
            });
    }

    // Initial connection
    connectToTikTok();

    // Reset connection every 20 minutes
    setInterval(() => {
        console.info("Resetting TikTok connection...");
        tiktokLiveConnection.disconnect()
            .then(() => connectToTikTok())
            .catch(err => {
                console.error("Failed to reset TikTok connection:", err);
                setTimeout(connectToTikTok, 30000);  // Retry after 30 seconds if disconnection fails
            });
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
function disconnect() {
    tiktokLiveConnection.disconnect();
}

module.exports = (io) => {
    initializeTikTok(io);
    return { disconnect };
};
