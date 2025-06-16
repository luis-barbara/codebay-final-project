const { StreamChat } = window.StreamChat;

const API_KEY = 'gndf3ucf32z2'; 
const client = new StreamChat(API_KEY);

const user = {
  id: 'frontend-user',
  name: 'Frontend User',
  image: 'https://getstream.io/random_png/?id=frontend-user&name=Frontend',
};

const userToken = client.devToken(user.id); 

let channel;

(async () => {
  await client.connectUser(user, userToken);

  channel = client.channel('messaging', 'marketplace-general', {
    name: 'Marketplace Chat',
    members: [user.id],
  });

  await channel.watch();
  updateMessages();

  channel.on('message.new', event => {
    channel.state.messages.push(event.message);
    updateMessages();
  });
})();

// Toggle chat
const chatIcon = document.querySelector('.fa-message');
const chatBox = document.getElementById('chat-box');
const chatClose = document.getElementById('chat-close');

chatIcon.addEventListener('click', () => {
  chatBox.style.display = 'flex';
});

chatClose.addEventListener('click', () => {
  chatBox.style.display = 'none';
});

document.getElementById('chatSend').addEventListener('click', async () => {
  const input = document.getElementById('chatMessageInput');
  const text = input.value.trim();
  if (!text) return;
  await channel.sendMessage({ text });
  input.value = '';
});

function updateMessages() {
  const messagesDiv = document.getElementById('chat-messages');
  messagesDiv.innerHTML = '';
  channel.state.messages.forEach(msg => {
    const msgEl = document.createElement('div');
    msgEl.textContent = `${msg.user.name}: ${msg.text}`;
    messagesDiv.appendChild(msgEl);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

