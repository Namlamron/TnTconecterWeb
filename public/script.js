const socket = io();

// Handle TikTok chat messages
socket.on('tiktokChat', data => {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('li');
    messageElement.textContent = `[TikTok] ${data.user}: ${data.message}`;
    chatMessages.insertBefore(messageElement, chatMessages.firstChild);
});

// Handle Twitch chat messages
socket.on('twitchChat', data => {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('li');
    messageElement.textContent = `[Twitch] ${data.user}: ${data.message}`;
    chatMessages.insertBefore(messageElement, chatMessages.firstChild);
});

// Handle TikTok member join
socket.on('tiktokMember', user => {
    const activityFeed = document.getElementById('activity-feed');
    const activityElement = document.createElement('li');
    activityElement.textContent = `[TikTok] ${user} joined the stream`;
    activityFeed.insertBefore(activityElement, activityFeed.firstChild);
});

// Handle Twitch subscriptions
socket.on('twitchSub', user => {
    const activityFeed = document.getElementById('activity-feed');
    const activityElement = document.createElement('li');
    activityElement.textContent = `[Twitch] ${user} subscribed!`;
    activityFeed.insertBefore(activityElement, activityFeed.firstChild);
});

// Handle TikTok gifts
socket.on('tiktokGift', data => {
    const activityFeed = document.getElementById('activity-feed');
    const activityElement = document.createElement('li');
    activityElement.textContent = `[TikTok] ${data.user} sent a gift: ${data.gift} (x${data.count})`;
    activityFeed.insertBefore(activityElement, activityFeed.firstChild);
});

// Handle TikTok follows
socket.on('tiktokFollow', data => {
    const activityFeed = document.getElementById('activity-feed');
    const activityElement = document.createElement('li');
    activityElement.textContent = `[TikTok] ${data.user} followed!`;
    activityFeed.insertBefore(activityElement, activityFeed.firstChild);
});
