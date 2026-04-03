export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodePrune — Token Optimizer</title>
  <style>
    :root {
      --bg: #08080d;
      --surface: #12121a;
      --surface-hover: #1a1a24;
      --border: #1e1e2e;
      --border-hover: #2e2e44;
      --text: #e4e4ef;
      --text-dim: #6b6b80;
      --text-muted: #44445a;
      --green: #4ade80;
      --green-dim: #164e3a;
      --blue: #60a5fa;
      --blue-dim: #1e3a5f;
      --purple: #a78bfa;
      --purple-dim: #2e1f5e;
      --orange: #fb923c;
      --orange-dim: #3b2408;
      --red: #f87171;
      --red-dim: #3b1414;
      --radius: 16px;
      --radius-sm: 10px;
      --shadow: 0 2px 12px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.05);
      --shadow-lg: 0 8px 32px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.06);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; padding: 20px; }

    /* ─── Bento Grid ─── */
    .bento {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-template-rows: auto;
      gap: 16px;
      max-width: 1400px;
      margin: 0 auto;
      grid-template-areas:
        "hdr   hdr   hdr   hdr   hdr   hdr   hdr   hdr   hdr   mode  mode  mode"
        "hero  hero  hero  hero  hero  hero  hero  hero  hero  hero  hero  hero"
        "sav   sav   sav   cost  cost  cost  reqs  reqs  reqs  mde   mde   mde"
        "bars  bars  bars  bars  bars  bars  bars  bars  bars  bars  bars  bars"
        "cmpA  cmpA  cmpA  cmpA  cmpA  cmpA  cmpB  cmpB  cmpB  cmpB  cmpB  cmpB"
        "log   log   log   log   log   log   log   log   log   log   log   log";
    }

    /* ─── Bento Block Base ─── */
    .block {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      box-shadow: var(--shadow);
      transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
    }
    .block:hover {
      border-color: var(--border-hover);
      box-shadow: var(--shadow-lg);
      transform: translateY(-1px);
    }

    /* ─── Header ─── */
    .b-header { grid-area: hdr; background: transparent; border: none; box-shadow: none; padding: 0 4px; display: flex; align-items: center; gap: 12px; }
    .b-header:hover { transform: none; box-shadow: none; }
    .logo { font-size: 26px; font-weight: 800; background: linear-gradient(135deg, #4ade80 0%, #60a5fa 50%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
    .live-pill { display: inline-flex; align-items: center; gap: 6px; background: var(--green-dim); color: var(--green); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

    /* ─── Mode Toggle ─── */
    .b-mode { grid-area: mode; display: flex; align-items: center; justify-content: flex-end; background: transparent; border: none; box-shadow: none; padding: 0; }
    .b-mode:hover { transform: none; box-shadow: none; }
    .mode-toggle { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 4px; }
    .mode-btn { padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; background: transparent; color: var(--text-dim); transition: all 0.25s; letter-spacing: 0.3px; }
    .mode-btn:hover { color: var(--text); background: var(--surface-hover); }
    .mode-btn.active { background: var(--green); color: #0a0a0f; box-shadow: 0 2px 8px rgba(74,222,128,0.3); }
    .mode-btn.pass.active { background: var(--orange); color: #0a0a0f; box-shadow: 0 2px 8px rgba(251,146,60,0.3); }

    /* ─── Hero (Big Savings) ─── */
    .b-hero {
      grid-area: hero;
      background: linear-gradient(135deg, #0a1f14 0%, #0f1a1a 40%, #121218 100%);
      border: 1px solid #1a3a2a;
      text-align: center;
      padding: 40px 20px;
      position: relative;
      overflow: hidden;
    }
    .b-hero::before {
      content: '';
      position: absolute;
      top: -50%; left: -50%;
      width: 200%; height: 200%;
      background: radial-gradient(circle at 50% 50%, rgba(74,222,128,0.06) 0%, transparent 60%);
      pointer-events: none;
    }
    .hero-value {
      font-size: 88px;
      font-weight: 900;
      background: linear-gradient(135deg, #4ade80, #22c55e, #16a34a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      position: relative;
    }
    .hero-label { font-size: 13px; color: var(--green); margin-top: 8px; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; position: relative; }

    /* ─── Stat Cards ─── */
    .b-saved { grid-area: sav; }
    .b-cost  { grid-area: cost; }
    .b-reqs  { grid-area: reqs; }
    .b-mode-card { grid-area: mde; }
    .card-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; font-weight: 600; }
    .card-value { font-size: 34px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.1; }
    .card-sub { font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.4; }
    .green { color: var(--green); }
    .blue { color: var(--blue); }
    .purple { color: var(--purple); }
    .orange { color: var(--orange); }
    .red { color: var(--red); }

    /* ─── Bar Comparison ─── */
    .b-bars { grid-area: bars; }
    .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .bar-row:last-child { margin-bottom: 0; }
    .bar-tag { min-width: 90px; font-size: 11px; font-weight: 700; text-align: right; letter-spacing: 0.5px; text-transform: uppercase; }
    .bar-track { flex: 1; height: 36px; background: #0e0e16; border-radius: 8px; overflow: hidden; position: relative; }
    .bar-fill { height: 100%; border-radius: 8px; transition: width 0.8s cubic-bezier(0.16,1,0.3,1); position: relative; }
    .bar-fill.original { background: linear-gradient(90deg, #f87171 0%, #ef4444 100%); }
    .bar-fill.optimized { background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%); }
    .bar-val { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 800; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.5); font-variant-numeric: tabular-nums; }
    .bar-ext { min-width: 80px; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }

    /* ─── Comparison Cards ─── */
    .b-cmpA { grid-area: cmpA; border-left: 3px solid var(--green); }
    .b-cmpB { grid-area: cmpB; border-left: 3px solid var(--orange); }
    .comp-title { font-size: 13px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.3px; }
    .comp-dot { width: 10px; height: 10px; border-radius: 50%; }
    .comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .comp-item-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; font-weight: 600; }
    .comp-item-value { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }

    /* ─── Request Log ─── */
    .b-log { grid-area: log; overflow-x: auto; }
    .log-title { font-size: 14px; font-weight: 700; margin-bottom: 14px; letter-spacing: 0.3px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 10px; font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid var(--border); font-weight: 700; }
    td { padding: 8px 10px; border-bottom: 1px solid #14141e; font-size: 12px; font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace; }
    tr:hover td { background: var(--surface-hover); }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 9px; margin: 1px; font-weight: 700; letter-spacing: 0.3px; }
    .badge.b-green { background: var(--green-dim); color: var(--green); }
    .badge.b-orange { background: var(--orange-dim); color: var(--orange); }
    .badge.b-blue { background: var(--blue-dim); color: var(--blue); }
    .mode-pill { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 800; letter-spacing: 0.5px; }
    .mode-pill.opt { background: var(--green-dim); color: var(--green); }
    .mode-pill.pass { background: var(--orange-dim); color: var(--orange); }
    .empty { text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px; }

    /* ─── Responsive ─── */
    @media (max-width: 1024px) {
      .bento {
        grid-template-columns: repeat(6, 1fr);
        grid-template-areas:
          "hdr   hdr   hdr   mode  mode  mode"
          "hero  hero  hero  hero  hero  hero"
          "sav   sav   sav   cost  cost  cost"
          "reqs  reqs  reqs  mde   mde   mde"
          "bars  bars  bars  bars  bars  bars"
          "cmpA  cmpA  cmpA  cmpB  cmpB  cmpB"
          "log   log   log   log   log   log";
      }
    }
    @media (max-width: 640px) {
      body { padding: 12px; }
      .bento {
        grid-template-columns: 1fr;
        grid-template-areas:
          "hdr" "mode" "hero"
          "sav" "cost" "reqs" "mde"
          "bars" "cmpA" "cmpB" "log";
        gap: 12px;
      }
      .b-mode { justify-content: flex-start; }
      .hero-value { font-size: 56px; }
      .card-value { font-size: 28px; }
      .comp-item-value { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="bento">

    <!-- Header -->
    <div class="block b-header">
      <span class="logo">CodePrune</span>
      <span class="live-pill"><span class="live-dot"></span>LIVE</span>
    </div>

    <!-- Mode Toggle -->
    <div class="block b-mode">
      <div class="mode-toggle">
        <button class="mode-btn active" id="btn-opt" onclick="setMode('optimized')">Optimized</button>
        <button class="mode-btn pass" id="btn-pass" onclick="setMode('passthrough')">Passthrough</button>
      </div>
    </div>

    <!-- Hero -->
    <div class="block b-hero">
      <div class="hero-value" id="big-pct">0%</div>
      <div class="hero-label">Total Token Savings</div>
    </div>

    <!-- Stat Cards -->
    <div class="block b-saved">
      <div class="card-label">Tokens Saved</div>
      <div class="card-value green" id="saved">0</div>
      <div class="card-sub" id="saved-sub">&mdash;</div>
    </div>
    <div class="block b-cost">
      <div class="card-label">Cost Saved</div>
      <div class="card-value purple" id="cost">$0</div>
      <div class="card-sub">Sonnet $3/Mtok &middot; Opus $5/Mtok</div>
    </div>
    <div class="block b-reqs">
      <div class="card-label">API Calls</div>
      <div class="card-value orange" id="requests">0</div>
      <div class="card-sub" id="req-sub">&mdash;</div>
    </div>
    <div class="block b-mode-card">
      <div class="card-label">Current Mode</div>
      <div class="card-value blue" id="mode-display">&mdash;</div>
      <div class="card-sub">Toggle above to switch</div>
    </div>

    <!-- Bar Comparison -->
    <div class="block b-bars">
      <div class="card-label" style="margin-bottom:16px">Input Token Comparison</div>
      <div class="bar-row">
        <div class="bar-tag red">Without</div>
        <div class="bar-track">
          <div class="bar-fill original" id="bar-orig" style="width:100%">
            <span class="bar-val" id="bar-orig-val">0</span>
          </div>
        </div>
        <div class="bar-ext red" id="bar-orig-label">0</div>
      </div>
      <div class="bar-row">
        <div class="bar-tag green">With</div>
        <div class="bar-track">
          <div class="bar-fill optimized" id="bar-opt" style="width:0%">
            <span class="bar-val" id="bar-opt-val">0</span>
          </div>
        </div>
        <div class="bar-ext green" id="bar-opt-label">0</div>
      </div>
    </div>

    <!-- Comparison: With CodePrune -->
    <div class="block b-cmpA">
      <div class="comp-title"><div class="comp-dot" style="background:var(--green)"></div>With CodePrune</div>
      <div class="comp-grid">
        <div><div class="comp-item-label">Requests</div><div class="comp-item-value green" id="comp-opt-req">0</div></div>
        <div><div class="comp-item-label">Input Tokens</div><div class="comp-item-value green" id="comp-opt-tokens">0</div></div>
        <div><div class="comp-item-label">Output Tokens</div><div class="comp-item-value" id="comp-opt-output">0</div></div>
        <div><div class="comp-item-label">Avg / Request</div><div class="comp-item-value green" id="comp-opt-avg">0</div></div>
      </div>
    </div>

    <!-- Comparison: Without CodePrune -->
    <div class="block b-cmpB">
      <div class="comp-title"><div class="comp-dot" style="background:var(--orange)"></div>Without CodePrune</div>
      <div class="comp-grid">
        <div><div class="comp-item-label">Requests</div><div class="comp-item-value orange" id="comp-pass-req">0</div></div>
        <div><div class="comp-item-label">Input Tokens</div><div class="comp-item-value orange" id="comp-pass-tokens">0</div></div>
        <div><div class="comp-item-label">Output Tokens</div><div class="comp-item-value" id="comp-pass-output">0</div></div>
        <div><div class="comp-item-label">Avg / Request</div><div class="comp-item-value orange" id="comp-pass-avg">0</div></div>
      </div>
    </div>

    <!-- Request Log -->
    <div class="block b-log">
      <div class="log-title">Request Log</div>
      <table>
        <thead>
          <tr><th>Time</th><th>Mode</th><th>Model</th><th>Original</th><th>Optimized</th><th>Saved</th><th>Optimizations</th></tr>
        </thead>
        <tbody id="log"><tr><td colspan="7" class="empty">Waiting for requests&hellip; Set ANTHROPIC_BASE_URL=http://localhost:4100</td></tr></tbody>
      </table>
    </div>

  </div>

  <script>
    function fmt(n) {
      if (n >= 1000000) return (n/1000000).toFixed(2) + 'M';
      if (n >= 1000) return (n/1000).toFixed(1) + 'K';
      return String(n);
    }

    async function setMode(mode) {
      await fetch('/api/mode', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({mode}) });
      refresh();
    }

    async function refresh() {
      try {
        const [statsRes, compRes, logRes, modeRes] = await Promise.all([
          fetch('/api/stats'), fetch('/api/comparison'), fetch('/api/requests?limit=30'), fetch('/api/mode')
        ]);
        const stats = await statsRes.json();
        const comp = await compRes.json();
        const log = await logRes.json();
        const md = await modeRes.json();

        // Mode
        document.getElementById('btn-opt').className = 'mode-btn' + (md.mode === 'optimized' ? ' active' : '');
        document.getElementById('btn-pass').className = 'mode-btn pass' + (md.mode === 'passthrough' ? ' active' : '');
        document.getElementById('mode-display').textContent = md.mode === 'optimized' ? 'OPTIMIZED' : 'PASSTHROUGH';

        // Hero
        document.getElementById('big-pct').textContent = stats.savingsPercent.toFixed(1) + '%';

        // Cards
        document.getElementById('saved').textContent = fmt(stats.totalSaved);
        document.getElementById('saved-sub').textContent = fmt(stats.totalInputOriginal) + ' \\u2192 ' + fmt(stats.totalInputOptimized);
        document.getElementById('cost').textContent = '$' + stats.costSaved.toFixed(2);
        document.getElementById('requests').textContent = String(stats.totalRequests);
        document.getElementById('req-sub').textContent = comp.optimized.totalRequests + ' opt \\u00b7 ' + comp.passthrough.totalRequests + ' raw';

        // Bars
        const mx = Math.max(stats.totalInputOriginal, 1);
        document.getElementById('bar-orig').style.width = '100%';
        document.getElementById('bar-opt').style.width = Math.max((stats.totalInputOptimized / mx) * 100, 3) + '%';
        document.getElementById('bar-orig-label').textContent = fmt(stats.totalInputOriginal);
        document.getElementById('bar-opt-label').textContent = fmt(stats.totalInputOptimized);

        // Comparison
        const o = comp.optimized, p = comp.passthrough;
        document.getElementById('comp-opt-req').textContent = String(o.totalRequests);
        document.getElementById('comp-opt-tokens').textContent = fmt(o.totalInputOptimized);
        document.getElementById('comp-opt-output').textContent = fmt(o.totalOutputTokens);
        document.getElementById('comp-opt-avg').textContent = o.totalRequests > 0 ? fmt(Math.round(o.totalInputOptimized / o.totalRequests)) : '0';
        document.getElementById('comp-pass-req').textContent = String(p.totalRequests);
        document.getElementById('comp-pass-tokens').textContent = fmt(p.totalInputOriginal);
        document.getElementById('comp-pass-output').textContent = fmt(p.totalOutputTokens);
        document.getElementById('comp-pass-avg').textContent = p.totalRequests > 0 ? fmt(Math.round(p.totalInputOriginal / p.totalRequests)) : '0';

        // Log
        const tbody = document.getElementById('log');
        if (log.length === 0) return;
        let rows = '';
        for (const r of log) {
          const saved = r.input_tokens_original - r.input_tokens_optimized;
          const pct = r.input_tokens_original > 0 ? ((saved / r.input_tokens_original) * 100).toFixed(0) : '0';
          let opts = [];
          try { opts = JSON.parse(r.optimizations || '[]'); } catch {}
          const time = new Date(r.timestamp).toLocaleTimeString();
          const modelShort = (r.model || '?').replace(/claude-/g, '').split('-').slice(0, 2).join('-');
          const mode = r.mode || 'optimized';
          const pill = mode === 'optimized'
            ? '<span class="mode-pill opt">OPT</span>'
            : '<span class="mode-pill pass">RAW</span>';
          const cls = saved > 0 ? 'green' : saved < 0 ? 'red' : '';

          rows += '<tr>';
          rows += '<td>' + time + '</td>';
          rows += '<td>' + pill + '</td>';
          rows += '<td>' + modelShort + '</td>';
          rows += '<td>' + fmt(r.input_tokens_original) + '</td>';
          rows += '<td>' + fmt(r.input_tokens_optimized) + '</td>';
          rows += '<td class="' + cls + '">' + fmt(saved) + ' (' + pct + '%)</td>';
          rows += '<td>';
          for (const tag of opts) {
            const c = tag.includes('clearing') ? 'b-green' : tag.includes('truncat') ? 'b-blue' : 'b-orange';
            rows += '<span class="badge ' + c + '">' + tag.replace(/_/g, ' ') + '</span>';
          }
          if (opts.length === 0) rows += '<span style="color:var(--text-muted)">none</span>';
          rows += '</td></tr>';
        }
        tbody.textContent = '';
        tbody.insertAdjacentHTML('beforeend', rows);
      } catch(e) { console.error(e); }
    }

    refresh();
    setInterval(refresh, 3000);
  </script>
</body>
</html>`;
}
