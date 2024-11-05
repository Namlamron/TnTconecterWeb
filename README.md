Connects to both tiktok and Twtich. shows chat and events seperetly but platforms are combined
IN server.js change 

// TikTok Username
let tiktokUsername = "yourtiktokUsername";

// Twitch configuration
const twitchClient = new tmi.Client({
    options: { debug: true },
    identity: {
        username: 'YourTwitchusername',
        password: 'oauth: Get this ' // Obtain at https://twitchapps.com/tmi/
    },
    channels: ['Twitch channel name'] // Replace with the Twitch channel to connect to
});
