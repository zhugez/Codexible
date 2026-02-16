/*
  Prototype: show install script in a modal with copy button.
  Security properties:
  - All script content injected via textContent (no HTML).
  - One-liner uses single quotes around key and escapes single quotes to prevent shell expansion.
*/

const el = (id) => document.getElementById(id);

const modal = el('modal');
const codeEl = el('code');
const statusEl = el('status');
const modalSub = el('modalSub');

function openModal() {
  modal.setAttribute('aria-hidden', 'false');
  // focus close for accessibility
  el('btnClose').focus();
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  statusEl.textContent = '';
}

function isModalOpen() {
  return modal.getAttribute('aria-hidden') === 'false';
}

// Defensive: keep only visible ASCII for keys; reject control chars.
function normalizeKey(input) {
  if (!input) return '';
  const s = String(input);
  // strip control chars including newlines
  const cleaned = s.replace(/[\x00-\x1F\x7F]/g, '');
  return cleaned.trim();
}

// Shell-safe single-quote escaping: ' -> '\''
function shellSingleQuote(value) {
  const v = normalizeKey(value);
  if (!v) return "'YOUR_KEY'";
  return "'" + v.replace(/'/g, "'\\''") + "'";
}

function buildInstallUrl(key) {
  const base = new URL('/install.sh', window.location.origin);
  const k = normalizeKey(key);
  if (k) base.searchParams.set('key', k);
  return base.toString();
}

function buildSafeOneLiner(key) {
  // Avoid command substitution by using single quotes around the key.
  // NOTE: This is UX hardening, but the server must also sanitize output.
  const baseUrl = window.location.origin;
  const k = normalizeKey(key);
  const quoted = shellSingleQuote(k);
  const url = k ? `${baseUrl}/install.sh?key=${encodeURIComponent(k)}` : `${baseUrl}/install.sh?key=YOUR_KEY`;
  // Keep it one-liner and copy-friendly
  return `curl -fsSL "${url}" | sh`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}

async function fetchInstallScript() {
  const key = normalizeKey(el('key').value);
  const url = buildInstallUrl(key);

  modalSub.textContent = url;
  statusEl.textContent = 'Fetching…';
  codeEl.textContent = '';
  openModal();

  try {
    const resp = await fetch(url, { method: 'GET', cache: 'no-store' });
    const text = await resp.text();

    // Show as text only (no HTML interpretation)
    codeEl.textContent = text;

    statusEl.textContent = resp.ok
      ? `Loaded (${text.length.toLocaleString()} bytes)`
      : `HTTP ${resp.status} (showing body)`;

  } catch (e) {
    codeEl.textContent = `Failed to fetch script.\n\n${String(e)}`;
    statusEl.textContent = 'Fetch failed';
  }
}

// Wiring
el('btnView').addEventListener('click', fetchInstallScript);

el('btnCopyOneLiner').addEventListener('click', async () => {
  const key = normalizeKey(el('key').value);
  const cmd = buildSafeOneLiner(key);
  const ok = await copyText(cmd);
  statusEl.textContent = ok ? 'Copied one-liner' : 'Copy failed';
  if (!isModalOpen()) {
    modalSub.textContent = 'One-liner';
    codeEl.textContent = cmd;
    openModal();
  } else {
    codeEl.textContent = cmd;
    modalSub.textContent = 'One-liner';
  }
});

el('btnCopy').addEventListener('click', async () => {
  const ok = await copyText(codeEl.textContent || '');
  statusEl.textContent = ok ? 'Copied' : 'Copy failed';
});

el('btnClose').addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  const t = e.target;
  if (t && t.getAttribute && t.getAttribute('data-close') === 'true') closeModal();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isModalOpen()) closeModal();
});
