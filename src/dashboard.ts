export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodePrune — Token Optimizer Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 24px; min-height: 100vh; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { font-size: 28px; background: linear-gradient(135deg, #4ade80, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .mode-toggle { display: flex; gap: 4px; background: #16161e; border: 1px solid #2a2a3a; border-radius: 8px; padding: 4px; }
    .mode-btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; background: transparent; color: #888; transition: all 0.2s; }
    .mode-btn.active { background: #4ade80; color: #0a0a0f; }
    .mode-btn.pass.active { background: #fb923c; color: #0a0a0f; }
    .subtitle { color: #888; font-size: 13px; }
    .live-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #4ade80; margin-right: 6px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

    /* Cards */
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #16161e; border: 1px solid #2a2a3a; border-radius: 12px; padding: 20px; transition: border-color 0.3s; }
    .card:hover { border-color: #4ade80; }
    .card-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .card-value { font-size: 36px; font-weight: 800; font-variant-numeric: tabular-nums; }
    .card-sub { font-size: 12px; color: #555; margin-top: 4px; }
    .green { color: #4ade80; }
    .blue { color: #60a5fa; }
    .purple { color: #a78bfa; }
    .orange { color: #fb923c; }
    .red { color: #f87171; }

    /* Comparison Section */
    .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .comp-card { background: #16161e; border: 1px solid #2a2a3a; border-radius: 12px; padding: 20px; }
    .comp-card.optimized { border-left: 3px solid #4ade80; }
    .comp-card.passthrough { border-left: 3px solid #fb923c; }
    .comp-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .comp-title .dot { width: 10px; height: 10px; border-radius: 50%; }
    .comp-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .comp-stat-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .comp-stat-value { font-size: 24px; font-weight: 700; font-variant-numeric: tabular-nums; }

    /* Big savings banner */
    .savings-banner { background: linear-gradient(135deg, #0f2a1a, #162020); border: 1px solid #1a3a2a; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center; }
    .savings-big { font-size: 72px; font-weight: 900; background: linear-gradient(135deg, #4ade80, #22c55e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-variant-numeric: tabular-nums; }
    .savings-label { font-size: 14px; color: #4ade80; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }

    /* Bar chart */
    .bar-section { background: #16161e; border: 1px solid #2a2a3a; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .bar-label { min-width: 80px; font-size: 12px; color: #888; text-align: right; }
    .bar-track { flex: 1; height: 32px; background: #1a1a2a; border-radius: 6px; overflow: hidden; position: relative; }
    .bar-fill { height: 100%; border-radius: 6px; transition: width 0.8s ease; position: relative; }
    .bar-fill.original { background: linear-gradient(90deg, #f87171, #ef4444); }
    .bar-fill.optimized { background: linear-gradient(90deg, #4ade80, #22c55e); }
    .bar-value { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .bar-value-outside { min-width: 70px; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }

    /* Timeline */
    .timeline { background: #16161e; border: 1px solid #2a2a3a; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .timeline canvas { width: 100%; height: 200px; }

    /* Table */
    .section-title { font-size: 16px; font-weight: 700; margin: 24px 0 12px; display: flex; align-items: center; gap: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #2a2a3a; }
    td { padding: 10px; border-bottom: 1px solid #1a1a2a; font-size: 13px; font-family: 'SF Mono', 'Cascadia Code', monospace; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin: 1px; font-weight: 600; }
    .badge.green { background: #164e3a; color: #4ade80; }
    .badge.orange { background: #3b2408; color: #fb923c; }
    .badge.blue { background: #1e3a5f; color: #60a5fa; }
    .mode-badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }
    .mode-badge.opt { background: #164e3a; color: #4ade80; }
    .mode-badge.pass { background: #3b2408; color: #fb923c; }
    .empty { text-align: center; padding: 40px; color: #555; }

    @media (max-width: 900px) {
      .cards { grid-template-columns: repeat(2, 1fr); }
      .comparison { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>CodePrune</h1>
      <p class="subtitle"><span class="live-dot"></span>Token Optimizer Dashboard &mdash; live</p>
    </div>
    <div class="mode-toggle">
      <button class="mode-btn active" id="btn-opt" onclick="setMode('optimized')">Optimized</button>
      <button class="mode-btn pass" id="btn-pass" onclick="setMode('passthrough')">Passthrough</button>
    </div>
  </div>

  <!-- Big savings banner -->
  <div class="savings-banner">
    <div class="savings-big" id="big-pct">0%</div>
    <div class="savings-label">Total Token Savings</div>
  </div>

  <!-- Stats cards -->
  <div class="cards">
    <div class="card">
      <div class="card-label">Tokens Saved</div>
      <div class="card-value green" id="saved">0</div>
      <div class="card-sub" id="saved-sub">-</div>
    </div>
    <div class="card">
      <div class="card-label">Cost Saved</div>
      <div class="card-value purple" id="cost">$0</div>
      <div class="card-sub">at Sonnet $3/Mtok input</div>
    </div>
    <div class="card">
      <div class="card-label">API Calls</div>
      <div class="card-value orange" id="requests">0</div>
      <div class="card-sub" id="req-sub">-</div>
    </div>
    <div class="card">
      <div class="card-label">Current Mode</div>
      <div class="card-value blue" id="mode-display">-</div>
      <div class="card-sub">toggle above to switch</div>
    </div>
  </div>

  <!-- Visual bar comparison -->
  <div class="bar-section">
    <div class="card-label" style="margin-bottom:16px">Input Token Comparison</div>
    <div class="bar-row">
      <div class="bar-label red">Without</div>
      <div class="bar-track">
        <div class="bar-fill original" id="bar-orig" style="width:100%">
          <span class="bar-value" id="bar-orig-val">0</span>
        </div>
      </div>
      <div class="bar-value-outside red" id="bar-orig-label">0</div>
    </div>
    <div class="bar-row">
      <div class="bar-label green">With</div>
      <div class="bar-track">
        <div class="bar-fill optimized" id="bar-opt" style="width:0%">
          <span class="bar-value" id="bar-opt-val">0</span>
        </div>
      </div>
      <div class="bar-value-outside green" id="bar-opt-label">0</div>
    </div>
  </div>

  <!-- Side-by-side comparison -->
  <div class="comparison">
    <div class="comp-card optimized">
      <div class="comp-title"><div class="dot" style="background:#4ade80"></div> With CodePrune</div>
      <div class="comp-stats">
        <div><div class="comp-stat-label">Requests</div><div class="comp-stat-value green" id="comp-opt-req">0</div></div>
        <div><div class="comp-stat-label">Input Tokens</div><div class="comp-stat-value green" id="comp-opt-tokens">0</div></div>
        <div><div class="comp-stat-label">Output Tokens</div><div class="comp-stat-value" id="comp-opt-output">0</div></div>
        <div><div class="comp-stat-label">Avg per Request</div><div class="comp-stat-value green" id="comp-opt-avg">0</div></div>
      </div>
    </div>
    <div class="comp-card passthrough">
      <div class="comp-title"><div class="dot" style="background:#fb923c"></div> Without CodePrune</div>
      <div class="comp-stats">
        <div><div class="comp-stat-label">Requests</div><div class="comp-stat-value orange" id="comp-pass-req">0</div></div>
        <div><div class="comp-stat-label">Input Tokens</div><div class="comp-stat-value orange" id="comp-pass-tokens">0</div></div>
        <div><div class="comp-stat-label">Output Tokens</div><div class="comp-stat-value" id="comp-pass-output">0</div></div>
        <div><div class="comp-stat-label">Avg per Request</div><div class="comp-stat-value orange" id="comp-pass-avg">0</div></div>
      </div>
    </div>
  </div>

  <!-- Request log -->
  <h3 class="section-title">Request Log</h3>
  <div class="card">
    <table>
      <thead>
        <tr><th>Time</th><th>Mode</th><th>Model</th><th>Original</th><th>Optimized</th><th>Saved</th><th>Optimizations</th></tr>
      </thead>
      <tbody id="log"><tr><td colspan="7" class="empty">No requests yet</td></tr></tbody>
    </table>
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
        const modeData = await modeRes.json();

        // Mode toggle
        const btnOpt = document.getElementById('btn-opt');
        const btnPass = document.getElementById('btn-pass');
        btnOpt.className = 'mode-btn' + (modeData.mode === 'optimized' ? ' active' : '');
        btnPass.className = 'mode-btn pass' + (modeData.mode === 'passthrough' ? ' active' : '');
        document.getElementById('mode-display').textContent = modeData.mode === 'optimized' ? 'OPTIMIZED' : 'PASSTHROUGH';

        // Big banner
        document.getElementById('big-pct').textContent = stats.savingsPercent.toFixed(1) + '%';

        // Cards
        document.getElementById('saved').textContent = fmt(stats.totalSaved);
        document.getElementById('saved-sub').textContent = fmt(stats.totalInputOriginal) + ' original -> ' + fmt(stats.totalInputOptimized) + ' optimized';
        document.getElementById('cost').textContent = '$' + stats.costSaved.toFixed(2);
        document.getElementById('requests').textContent = String(stats.totalRequests);
        document.getElementById('req-sub').textContent = comp.optimized.totalRequests + ' optimized, ' + comp.passthrough.totalRequests + ' passthrough';

        // Bar chart
        const maxTokens = Math.max(stats.totalInputOriginal, 1);
        document.getElementById('bar-orig').style.width = '100%';
        document.getElementById('bar-opt').style.width = Math.max((stats.totalInputOptimized / maxTokens) * 100, 2) + '%';
        document.getElementById('bar-orig-label').textContent = fmt(stats.totalInputOriginal);
        document.getElementById('bar-opt-label').textContent = fmt(stats.totalInputOptimized);

        // Comparison
        const o = comp.optimized;
        const p = comp.passthrough;
        document.getElementById('comp-opt-req').textContent = String(o.totalRequests);
        document.getElementById('comp-opt-tokens').textContent = fmt(o.totalInputOptimized);
        document.getElementById('comp-opt-output').textContent = fmt(o.totalOutputTokens);
        document.getElementById('comp-opt-avg').textContent = o.totalRequests > 0 ? fmt(Math.round(o.totalInputOptimized / o.totalRequests)) : '0';
        document.getElementById('comp-pass-req').textContent = String(p.totalRequests);
        document.getElementById('comp-pass-tokens').textContent = fmt(p.totalInputOriginal);
        document.getElementById('comp-pass-output').textContent = fmt(p.totalOutputTokens);
        document.getElementById('comp-pass-avg').textContent = p.totalRequests > 0 ? fmt(Math.round(p.totalInputOriginal / p.totalRequests)) : '0';

        // Table
        const tbody = document.getElementById('log');
        if (log.length === 0) return;

        let rows = '';
        for (const r of log) {
          const saved = r.input_tokens_original - r.input_tokens_optimized;
          const pct = r.input_tokens_original > 0 ? ((saved / r.input_tokens_original) * 100).toFixed(0) : '0';
          let opts = [];
          try { opts = JSON.parse(r.optimizations || '[]'); } catch {}
          const time = new Date(r.timestamp).toLocaleTimeString();
          const modelShort = (r.model || 'unknown').replace(/claude-/g, '').split('-').slice(0, 2).join('-');
          const mode = r.mode || 'optimized';
          const modeBadge = mode === 'optimized'
            ? '<span class="mode-badge opt">OPT</span>'
            : '<span class="mode-badge pass">RAW</span>';
          const savedClass = saved > 0 ? 'green' : (saved < 0 ? 'red' : '');

          rows += '<tr>';
          rows += '<td>' + time + '</td>';
          rows += '<td>' + modeBadge + '</td>';
          rows += '<td>' + modelShort + '</td>';
          rows += '<td>' + fmt(r.input_tokens_original) + '</td>';
          rows += '<td>' + fmt(r.input_tokens_optimized) + '</td>';
          rows += '<td class="' + savedClass + '">' + fmt(saved) + ' (' + pct + '%)</td>';
          rows += '<td>';
          for (const o of opts) {
            const cat = o.includes('clearing') ? 'green' : o.includes('truncat') ? 'blue' : 'orange';
            rows += '<span class="badge ' + cat + '">' + o.replace(/_/g, ' ') + '</span>';
          }
          if (opts.length === 0) rows += '<span style="color:#555">none</span>';
          rows += '</td>';
          rows += '</tr>';
        }
        tbody.textContent = '';
        tbody.insertAdjacentHTML('beforeend', rows);
      } catch(e) { console.error('Dashboard error:', e); }
    }

    refresh();
    setInterval(refresh, 3000);
  </script>
</body>
</html>`;
}
