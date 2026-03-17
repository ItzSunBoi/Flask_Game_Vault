(function () {
  const COOKIE_NAME = 'gamevault_player';

  function randRoomCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function readProfileCookie() {
    try {
      const parts = document.cookie.split(';').map(v => v.trim());
      const row = parts.find(v => v.startsWith(COOKIE_NAME + '='));
      if (!row) return {};
      const raw = decodeURIComponent(row.slice(COOKIE_NAME.length + 1));
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeProfileCookie(profile) {
    try {
      const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString();
      const value = encodeURIComponent(JSON.stringify(profile || {}));
      document.cookie = `${COOKIE_NAME}=${value}; expires=${expires}; path=/; SameSite=Lax`;
    } catch (_) {}
  }

  function normalizePlayerName(name, fallback) {
    const value = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 24);
    return value || fallback || ('Player' + Math.floor(Math.random() * 900 + 100));
  }

  function normalizeRoomCode(room, fallback) {
    const value = String(room || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);
    return value || fallback || randRoomCode();
  }

  function normalizeMultiplayerParams(options) {
    const opts = options || {};
    const params = new URLSearchParams(window.location.search);
    const cookieProfile = readProfileCookie();
    const storedName = localStorage.getItem('playerName') || '';
    const storedRoom = localStorage.getItem('lastRoomId') || '';
    const storedGame = localStorage.getItem('lastGameId') || '';
    const storedParty = localStorage.getItem('partyId') || '';

    let room = params.get('room') || cookieProfile.room || storedRoom || '';
    let name = params.get('name') || cookieProfile.name || storedName || '';
    let game = opts.game || params.get('game') || cookieProfile.game || storedGame || '';
    let party = params.get('party') || cookieProfile.party || storedParty || '';

    room = normalizeRoomCode(room, randRoomCode());
    name = normalizePlayerName(name, opts.defaultName || 'Player');
    game = String(game || '').trim().toLowerCase();
    party = party ? normalizeRoomCode(party, '') : '';

    localStorage.setItem('playerName', name);
    localStorage.setItem('lastRoomId', room);
    if (game) localStorage.setItem('lastGameId', game);
    if (party) localStorage.setItem('partyId', party);
    else localStorage.removeItem('partyId');
    writeProfileCookie({ name, room, game, party });

    const next = new URLSearchParams(window.location.search);
    if (next.get('room') !== room) next.set('room', room);
    if (next.get('name') !== name) next.set('name', name);
    if (party) next.set('party', party);
    else next.delete('party');
    const nextUrl = `${window.location.pathname}?${next.toString()}`;
    if (nextUrl !== `${window.location.pathname}${window.location.search}`) {
      history.replaceState(null, '', nextUrl);
    }

    return { roomId: room, playerName: name, game, partyId: party, params: next };
  }

  function bindPingDisplay(ws, elementOrId) {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el || !ws) return;

    const render = (ms) => {
      const n = Math.max(0, Math.round(ms || 0));
      let quality = 'GOOD';
      if (n >= 180) quality = 'POOR';
      else if (n >= 90) quality = 'OK';
      el.textContent = `Ping ${n} ms`;
      el.dataset.quality = quality.toLowerCase();
    };

    el.textContent = 'Ping -- ms';
    ws.onping = ({ latencyMs }) => render(latencyMs);
  }

  window.GameVaultMP = {
    randRoomCode,
    normalizePlayerName,
    normalizeMultiplayerParams,
    bindPingDisplay,
  };
})();
