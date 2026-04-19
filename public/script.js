// ---------------------------------------------------------------
// Chat UI – talks to our Pages Function proxy at /api/chat
// ---------------------------------------------------------------
const chatLog = document.getElementById('chat-log');
const form    = document.getElementById('chat-form');
const input   = document.getElementById('user-input');

/**
 * Append a message bubble to the chat log.
 * @param {{text:string, role:'user'|'assistant'}} msg
 */
function addMessage({ text, role }) {
  const div = document.createElement('div');
  div.classList.add('message', role === 'user' ? 'user' : 'bot');
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight; // keep newest visible
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const userText = input.value.trim();
  if (!userText) return;

  // Show user message immediately
  addMessage({ text: userText, role: 'user' });
  input.value = '';
  input.disabled = true;
  form.querySelector('button').disabled = true;

  try {
    // ----- 1️⃣ Read the selected model from the dropdown -----
    const modelChoice = document.getElementById('model-select').value;

    // ----- 2️⃣ Call our Pages Function proxy -----
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelChoice,                     // <-- model selected by the user
        messages: [{ role: 'user', content: userText }]
      })
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    // OpenRouter returns: { choices: [{ message: { role, content } }], ... }
    const botText = data.choices?.[0]?.message?.content ?? '(no response)';
    addMessage({ text: botText, role: 'assistant' });
  } catch (err) {
    console.error(err);
    addMessage({ text: `❌ Error: ${err.message}`, role: 'assistant' });
  } finally {
    input.disabled = false;
    form.querySelector('button').disabled = false;
    input.focus();
  }
});
