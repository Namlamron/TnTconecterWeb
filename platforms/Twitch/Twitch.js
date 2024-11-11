const { getConnection } = require('./TwitchConnection'); // Import the shared connection

let twitchLiveConnection;

async function initializeTwitch(io, _twitchUsername) {
    twitchLiveConnection = getConnection();

    if (!twitchLiveConnection) {
        console.error("Twitch connection is not available.");
        return;
    }

    // Handle Twitch events
    twitchLiveConnection.on('chat', data => {
        try {
            console.log(`Twitch ${data.username} says: ${data.message}`);
            io.emit('twitchChat', { user: data.username, message: data.message });
        } catch (err) {
            console.error("Error in chat event handler:", err);
        }
    });

    twitchLiveConnection.on('gift', data => {
        try {
            console.log(`Twitch ${data.username} sent a gift: ${data.giftName} (x${data.count})`);
            io.emit('twitchGift', { user: data.username, gift: data.giftName, count: data.count });
        } catch (err) {
            console.error("Error in gift event handler:", err);
        }
    });

    twitchLiveConnection.on('follow', data => {
        try {
            console.log(`Twitch ${data.username} followed!`);
            io.emit('twitchFollow', { user: data.username });
        } catch (err) {
            console.error("Error in follow event handler:", err);
        }
    });
}

// Disconnect function to clean up on exit
async function disconnect() {
    if (twitchLiveConnection) {
        try {
            await twitchLiveConnection.disconnect();
            console.info("Disconnected from Twitch.");
        } catch (err) {
            console.error("Failed to disconnect Twitch:", err);
        }
    }
}

module.exports = (io, twitchUsername) => {
    initializeTwitch(io, twitchUsername);
    return { disconnect };
};
