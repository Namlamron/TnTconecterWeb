const { getConnection } = require('./TiktokConnection'); // Import the shared connection

let tiktokLiveConnection;

async function initializeTiktokCommands(io, tiktokUsername) {
    tiktokLiveConnection = getConnection();

    if (!tiktokLiveConnection) {
        console.error("TikTok connection is not available.");
        return;
    }

    // Event handler for comments
    tiktokLiveConnection.on('chat', async data => {
        const message = data.comment;

        // Check if the message starts with "!"
        if (message.startsWith('!')) {
            const command = message.slice(1).split(' ')[0]; // Extract command after "!"
            const args = message.slice(command.length + 2); // Extract arguments if any

            console.log(`Received command: !${command} with args: ${args}`);
            io.emit('commandReceived', { command, args });

            // Handle commands and send responses to TikTok
            let responseMessage = '';

            if (command === 'hello') {
                responseMessage = `Hello, ${data.nickname}! 👋`;
            } if (command === 'hello') {
                responseMessage = `Hello, ${data.nickname}! 👋`;
            } else if (command === 'play') {
            } else if (command === 'Discord') {
                responseMessage = `Join us on Discord: https://discord.gg/4xpBGXjZRx`;
            } else {
                responseMessage = `Unknown command: !${command}`;
            }

            // Send response back to TikTok
            if (responseMessage) {
                try {
                    await tiktokLiveConnection.sendMessage(responseMessage);
                    console.log(`Sent response to TikTok: ${responseMessage}`);
                } catch (err) {
                    console.error("Failed to send message to TikTok:", err);
                }
            }

            // Emit response to connected clients
            io.emit('botResponse', { user: data.nickname, message: responseMessage });
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
    initializeTiktokCommands(io, tiktokUsername);
    return { disconnect };
};
