
(function () {
  const SYSTEM_PROMPT = `You are the PulseUp Campus Health Clinic AI assistant at CPUT 
(Cape Peninsula University of Technology). Help students and staff with:
- Clinic services: General Consultations, Reproductive Health, HIV & STI Testing, TB, Vaccines, Chronic Care
- How to book appointments
- Clinic hours and locations (Cape Town Campus and Wellington Campus)
- General health questions
- Emergency contacts: 021 460 3999
Keep replies short, warm, and helpful. All student services are 100% free and confidential.`;

  const fab     = document.getElementById('chatFab');
  const popup   = document.getElementById('chatPopup');
  const closeBtn = document.getElementById('chatClose');
  const msgs    = document.getElementById('cpMsgs');
  const input   = document.getElementById('cpInput');
  const send    = document.getElementById('cpSend');
  const history = [];

  /* ── Toggle popup ── */
  function toggle() {
    popup.classList.toggle('open');
    if (popup.classList.contains('open')) {
      input.focus();
      msgs.scrollTop = msgs.scrollHeight;
    }
  }
  fab.addEventListener('click', toggle);
  closeBtn.addEventListener('click', toggle);

  /* ── Add message bubble ── */
  function addMsg(role, text) {
    const wrap = document.createElement('div');
    wrap.className = 'cm ' + (role === 'user' ? 'user' : 'bot');

    if (role !== 'user') {
      const av = document.createElement('div');
      av.className = 'cm-av';
      av.textContent = '🤖';
      wrap.appendChild(av);
    }

    const bubble = document.createElement('div');
    bubble.className = 'cm-bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── Typing indicator ── */
  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'cm bot';
    wrap.id = 'cpTyping';

    const av = document.createElement('div');
    av.className = 'cm-av';
    av.textContent = '🤖';
    wrap.appendChild(av);

    const dots = document.createElement('div');
    dots.className = 'cm-bubble cp-typing';
    dots.innerHTML = '<div class="cp-dot"></div><div class="cp-dot"></div><div class="cp-dot"></div>';
    wrap.appendChild(dots);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('cpTyping');
    if (el) el.remove();
  }

  /* ── Send message to Claude API ── */
  async function chat() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    send.disabled = true;
    addMsg('user', text);
    history.push({ role: 'user', content: text });
    showTyping();

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-dangerous-direct-browser-calls': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 350,
          system: SYSTEM_PROMPT,
          messages: history
        })
      });

      const data = await res.json();
      removeTyping();
      const reply = data.content?.[0]?.text
        || 'Sorry, I could not respond right now. Please call 021 460 3999.';
      history.push({ role: 'assistant', content: reply });
      addMsg('bot', reply);

    } catch (err) {
      removeTyping();
      addMsg('bot', 'Something went wrong. Please call 021 460 3999.');
      console.error('PulseUp chatbot error:', err);
    }

    send.disabled = false;
    input.focus();
  }

  send.addEventListener('click', chat);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') chat(); });
})();
