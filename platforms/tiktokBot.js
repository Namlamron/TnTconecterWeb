const { getConnection } = require('./tiktokConnection'); // Import the shared connection

let tiktokLiveConnection;

async function initializeTikTokBot(io, tiktokUsername) {
    tiktokLiveConnection = getConnection();

    if (!tiktokLiveConnection) {
        console.error("TikTok connection is not available.");
        return;
    }

    // Event handler for comments
    tiktokLiveConnection.on('chat', data => {
        const message = data.comment;

        // Check if the message starts with "!"
        if (message.startsWith('!')) {
            const command = message.slice(1).split(' ')[0]; // Extract command after "!"
            const args = message.slice(command.length + 2); // Extract arguments if any

            console.log(`Received command: !${command} with args: ${args}`);
            io.emit('commandReceived', { command, args });

            // Add custom commands here
            if (command === 'hello') {
                io.emit('botResponse', { user: data.nickname, message: `Hello, ${data.nickname}! 👋` });
            } else if (command === 'help') {
                io.emit('botResponse', { user: data.nickname, message: `Here are the available commands: !hello, !help` });
            } else if (command === 'Discord') {
                io.emit('botResponse', { user: data.nickname, message: `Join us on Discord: https://discord.gg/4xpBGXjZRx` });
            } else {
                io.emit('botResponse', { user: data.nickname, message: `Unknown command: !${command}` });
            }
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
    initializeTikTokBot(io, tiktokUsername);
    return { disconnect };
};
