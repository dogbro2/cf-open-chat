const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const messages = document.getElementById('chat-messages');
const modelSelect = document.getElementById('model');

function addMessage(text, isUser) {
  const div = document.createElement('div');
  div.className = `message ${isUser ? 'user' : 'bot'}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, true);
  input.value = '';
  input.disabled = true;
  form.querySelector('button').disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelSelect.value,
        messages: [{ role: 'user', content: userText }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const botText = data.choices?.[0]?.message?.content || 'No response';
    addMessage(botText, false);
  } catch (error) {
    addMessage(`Error: ${error.message}`, false);
  } finally {
    input.disabled = false;
    form.querySelector('button').disabled = false;
    input.focus();
  }
});
