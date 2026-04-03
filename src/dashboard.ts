export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodePrune Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 24px; }
    h1 { font-size: 28px; margin-bottom: 4px; }
    .subtitle { color: #888; margin-bottom: 24px; font-size: 14px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: #16161e; border: 1px solid #2a2a3a; border-radius: 12px; padding: 20px; }
    .card-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .card-value { font-size: 32px; font-weight: 700; }
    .green { color: #4ade80; }
    .blue { color: #60a5fa; }
    .purple { color: #a78bfa; }
    .orange { color: #fb923c; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #2a2a3a; }
    td { padding: 10px; border-bottom: 1px solid #1a1a2a; font-size: 14px; font-family: 'SF Mono', 'Cascadia Code', monospace; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; background: #164e3a; color: #4ade80; margin: 1px; }
    .bar-container { background: #1a1a2a; border-radius: 4px; height: 24px; overflow: hidden; position: relative; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #4ade80, #22c55e); border-radius: 4px; transition: width 0.5s; }
    .bar-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: 600; color: #fff; }
    .section-title { font-size: 16px; margin: 24px 0 12px; }
    .empty { text-align: center; padding: 40px; color: #555; }
  </style>
</head>
<body>
  <h1>CodePrune</h1>
  <p class="subtitle">Token Optimizer Dashboard &mdash; auto-refreshes every 5s</p>

  <div class="cards">
    <div class="card">
      <div class="card-label">Tokens Saved</div>
      <div class="card-value green" id="saved">-</div>
    </div>
    <div class="card">
      <div class="card-label">Savings</div>
      <div class="card-value blue" id="percent">-</div>
    </div>
    <div class="card">
      <div class="card-label">Cost Saved</div>
      <div class="card-value purple" id="cost">-</div>
    </div>
    <div class="card">
      <div class="card-label">API Calls</div>
      <div class="card-value orange" id="requests">0</div>
    </div>
  </div>

  <div class="card" style="margin-bottom:24px">
    <div class="card-label" style="margin-bottom:8px">Input Token Ratio: Original vs Optimized</div>
    <div style="display:flex;gap:12px;align-items:center">
      <span id="original-label" style="font-size:12px;color:#888;min-width:80px">0 tokens</span>
      <div class="bar-container" style="flex:1">
        <div class="bar-fill" id="bar" style="width:0%"></div>
        <div class="bar-label" id="bar-text">0%</div>
      </div>
      <span id="optimized-label" style="font-size:12px;color:#4ade80;min-width:80px;text-align:right">0 tokens</span>
    </div>
  </div>

  <h3 class="section-title">Request Log</h3>
  <div class="card">
    <table>
      <thead>
        <tr><th>Time</th><th>Model</th><th>Original</th><th>Optimized</th><th>Saved</th><th>Optimizations</th></tr>
      </thead>
      <tbody id="log"><tr><td colspan="6" class="empty">No requests yet. Set ANTHROPIC_BASE_URL=http://localhost:4100 and use Claude Code.</td></tr></tbody>
    </table>
  </div>

  <script>
    function fmt(n) {
      if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n/1000).toFixed(1) + 'K';
      return String(n);
    }

    async function refresh() {
      try {
        const [statsRes, logRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/requests?limit=30')
        ]);
        const stats = await statsRes.json();
        const log = await logRes.json();

        document.getElementById('saved').textContent = fmt(stats.totalSaved);
        document.getElementById('percent').textContent = stats.savingsPercent.toFixed(1) + '%';
        document.getElementById('cost').textContent = '$' + stats.costSaved.toFixed(4);
        document.getElementById('requests').textContent = String(stats.totalRequests);
        document.getElementById('bar').style.width = Math.min(stats.savingsPercent, 100) + '%';
        document.getElementById('bar-text').textContent = stats.savingsPercent.toFixed(1) + '% saved';
        document.getElementById('original-label').textContent = fmt(stats.totalInputOriginal) + ' original';
        document.getElementById('optimized-label').textContent = fmt(stats.totalInputOptimized) + ' optimized';

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

          rows += '<tr>';
          rows += '<td>' + time + '</td>';
          rows += '<td>' + modelShort + '</td>';
          rows += '<td>' + fmt(r.input_tokens_original) + '</td>';
          rows += '<td>' + fmt(r.input_tokens_optimized) + '</td>';
          rows += '<td class="green">' + fmt(saved) + ' (' + pct + '%)</td>';
          rows += '<td>';
          for (const o of opts) {
            rows += '<span class="badge">' + o.replace(/_/g, ' ') + '</span>';
          }
          rows += '</td>';
          rows += '</tr>';
        }
        tbody.textContent = '';
        tbody.insertAdjacentHTML('beforeend', rows);
      } catch(e) { console.error('Dashboard refresh error:', e); }
    }

    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`;
}
