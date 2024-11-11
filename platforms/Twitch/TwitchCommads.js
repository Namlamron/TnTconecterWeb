const tmi = require('tmi.js');

// Set up your Twitch bot configuration
const opts = {
  identity: {
    username: 'Namlamron',
    password: 'oauth:t8p3n8wn1akr744zeo495115c1btyc', // You can get your OAuth token from https://twitchapps.com/tmi/
  },
  channels: [
    'Namlamron', // Replace with the channel name you want to join
  ],
};

// Create a client instance
const client = new tmi.Client(opts);

// Event listener for when the bot connects
client.on('connected', (addr, port) => {
  console.log(`* Connected to ${addr}:${port}`);
});

// Event listener for new messages in chat
client.on('message', (channel, tags, message, self) => {
  if (self) return; // Ignore messages from the bot itself

  console.log(`${tags['display-name']}: ${message}`);

  // Example: Respond to a command
  if (message.toLowerCase() === '!hello') {
    client.say(channel, `Hello, ${tags['display-name']}!`);
  }
  if (message.toLowerCase() === '!boop') {
    client.say(channel, `Get booped, ${tags['display-name']}!`);
  }
});

// Connect to Twitch
client.connect();
