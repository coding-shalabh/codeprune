export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodePrune</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #F9FAFB;
      --surface: #FFFFFF;
      --border: #E5E7EB;
      --border-hover: #D1D5DB;
      --text-primary: #111827;
      --text-secondary: #6B7280;
      --text-muted: #9CA3AF;
      --emerald: #10B981;
      --emerald-light: #D1FAE5;
      --emerald-bg: #ECFDF5;
      --rose: #F43F5E;
      --rose-light: #FFE4E6;
      --rose-bg: #FFF1F2;
      --purple: #8B5CF6;
      --purple-light: #EDE9FE;
      --blue: #3B82F6;
      --blue-light: #DBEAFE;
      --amber: #F59E0B;
      --amber-light: #FEF3C7;
      --radius: 14px;
      --shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
      --shadow-hover: 0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-sans);
      background: var(--bg);
      color: var(--text-primary);
      min-height: 100vh;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }

    /* ─── Bento Grid ─── */
    .bento {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 16px;
      max-width: 1360px;
      margin: 0 auto;
      grid-template-areas:
        "hdr   hdr   hdr   hdr   hdr   hdr   hdr   hdr   hdr   ctrl  ctrl  ctrl"
        "hero  hero  hero  hero  hero  hero  hero  hero  hero  hero  hero  hero"
        "sav   sav   sav   cost  cost  cost  reqs  reqs  reqs  mde   mde   mde"
        "bars  bars  bars  bars  bars  bars  bars  bars  bars  bars  bars  bars"
        "cmpA  cmpA  cmpA  cmpA  cmpA  cmpA  cmpB  cmpB  cmpB  cmpB  cmpB  cmpB"
        "log   log   log   log   log   log   log   log   log   log   log   log";
    }

    /* ─── Block Base ─── */
    .bx {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      box-shadow: var(--shadow);
      transition: box-shadow 0.25s, border-color 0.25s, transform 0.2s;
    }
    .bx:hover {
      box-shadow: var(--shadow-hover);
      border-color: var(--border-hover);
      transform: translateY(-2px);
    }

    /* ─── Header ─── */
    .b-hdr { grid-area: hdr; background: none; border: none; box-shadow: none; padding: 0 2px; display: flex; align-items: center; gap: 14px; }
    .b-hdr:hover { transform: none; box-shadow: none; border-color: transparent; }
    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.6px;
      color: var(--text-primary);
    }
    .logo span { color: var(--emerald); }
    .live-chip {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--emerald-light);
      color: var(--emerald);
      font-size: 11px; font-weight: 700;
      padding: 4px 12px; border-radius: 20px;
      letter-spacing: 0.6px;
    }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--emerald); animation: blink 2s infinite; }
    @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

    /* ─── Controls ─── */
    .b-ctrl { grid-area: ctrl; background: none; border: none; box-shadow: none; padding: 0; display: flex; align-items: center; justify-content: flex-end; }
    .b-ctrl:hover { transform: none; box-shadow: none; border-color: transparent; }
    .toggle-group {
      display: inline-flex; gap: 2px;
      background: #F3F4F6; border: 1px solid var(--border);
      border-radius: 10px; padding: 3px;
    }
    .tgl {
      padding: 7px 16px; border-radius: 8px; border: none;
      cursor: pointer; font-family: var(--font-sans);
      font-size: 12px; font-weight: 600;
      background: transparent; color: var(--text-secondary);
      transition: all 0.2s;
    }
    .tgl:hover { color: var(--text-primary); background: #E5E7EB; }
    .tgl.on { background: var(--emerald); color: #fff; box-shadow: 0 1px 4px rgba(16,185,129,0.25); }
    .tgl.pass.on { background: var(--rose); color: #fff; box-shadow: 0 1px 4px rgba(244,63,94,0.25); }

    /* ─── Hero ─── */
    .b-hero {
      grid-area: hero;
      text-align: center;
      padding: 44px 20px;
      background: var(--emerald-bg);
      border-color: #A7F3D0;
    }
    .b-hero:hover { border-color: var(--emerald); }
    .hero-num {
      font-family: var(--font-mono);
      font-size: 84px; font-weight: 800;
      color: var(--emerald);
      line-height: 1;
      letter-spacing: -2px;
    }
    .hero-tag {
      font-size: 12px; font-weight: 700;
      color: #059669;
      margin-top: 8px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    /* ─── Metric Cards ─── */
    .b-sav  { grid-area: sav; }
    .b-cost { grid-area: cost; }
    .b-reqs { grid-area: reqs; }
    .b-mde  { grid-area: mde; }

    .lbl {
      font-size: 10px; font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .val {
      font-family: var(--font-mono);
      font-size: 32px; font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.5px;
    }
    .sub { font-size: 11px; color: var(--text-secondary); margin-top: 6px; }
    .c-emerald { color: var(--emerald); }
    .c-purple { color: var(--purple); }
    .c-amber  { color: var(--amber); }
    .c-blue   { color: var(--blue); }
    .c-rose   { color: var(--rose); }

    /* ─── Indicator Dots ─── */
    .indicator { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
    .indicator.emerald { background: var(--emerald); }
    .indicator.purple  { background: var(--purple); }
    .indicator.amber   { background: var(--amber); }
    .indicator.blue    { background: var(--blue); }

    /* ─── Bars ─── */
    .b-bars { grid-area: bars; }
    .bar-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .bar-row:last-child { margin-bottom: 0; }
    .bar-tag {
      min-width: 80px; text-align: right;
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.5px; text-transform: uppercase;
    }
    .bar-track { flex: 1; height: 36px; background: #F3F4F6; border-radius: 10px; overflow: hidden; position: relative; }
    .bar-fill { height: 100%; border-radius: 10px; transition: width 0.8s cubic-bezier(0.16,1,0.3,1); position: relative; min-width: 2px; }
    .bar-fill.without { background: linear-gradient(90deg, #FDA4AF 0%, #F43F5E 100%); }
    .bar-fill.with    { background: linear-gradient(90deg, #6EE7B7 0%, #10B981 100%); }
    .bar-num {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      font-family: var(--font-mono); font-size: 12px; font-weight: 700;
      color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .bar-ext {
      min-width: 75px;
      font-family: var(--font-mono);
      font-size: 12px; font-weight: 700;
    }

    /* ─── Comparison ─── */
    .b-cmpA { grid-area: cmpA; border-left: 3px solid var(--emerald); }
    .b-cmpA:hover { border-color: var(--emerald); }
    .b-cmpB { grid-area: cmpB; border-left: 3px solid var(--rose); }
    .b-cmpB:hover { border-color: var(--rose); }
    .cmp-head {
      font-size: 13px; font-weight: 700; margin-bottom: 16px;
      display: flex; align-items: center; gap: 8px;
    }
    .cmp-dot { width: 10px; height: 10px; border-radius: 50%; }
    .cmp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .cmp-lbl { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
    .cmp-val { font-family: var(--font-mono); font-size: 22px; font-weight: 700; }

    /* ─── Log ─── */
    .b-log { grid-area: log; overflow-x: auto; }
    .log-head { font-size: 14px; font-weight: 700; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; padding: 8px 10px;
      font-size: 10px; font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 1.5px;
      border-bottom: 2px solid #F3F4F6;
    }
    td {
      padding: 9px 10px;
      border-bottom: 1px solid #F3F4F6;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--text-primary);
    }
    tr:hover td { background: #F9FAFB; }
    .pill {
      display: inline-block; padding: 3px 8px;
      border-radius: 6px; font-size: 9px; font-weight: 700;
      letter-spacing: 0.5px; font-family: var(--font-sans);
    }
    .pill.opt  { background: var(--emerald-light); color: #059669; }
    .pill.pass { background: var(--rose-light); color: #E11D48; }
    .tag {
      display: inline-block; padding: 3px 8px;
      border-radius: 6px; font-size: 9px; font-weight: 600;
      margin: 1px; font-family: var(--font-sans);
    }
    .tag.t-green  { background: var(--emerald-light); color: #059669; }
    .tag.t-blue   { background: var(--blue-light); color: #2563EB; }
    .tag.t-amber  { background: var(--amber-light); color: #B45309; }
    .tag.t-purple { background: var(--purple-light); color: #7C3AED; }
    .empty-row { text-align: center; padding: 48px 20px; color: var(--text-muted); font-family: var(--font-sans); font-size: 13px; }

    /* ─── Responsive ─── */
    @media (max-width: 1024px) {
      .bento {
        grid-template-columns: repeat(6, 1fr);
        grid-template-areas:
          "hdr   hdr   hdr   ctrl  ctrl  ctrl"
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
          "hdr" "ctrl" "hero"
          "sav" "cost" "reqs" "mde"
          "bars" "cmpA" "cmpB" "log";
        gap: 12px;
      }
      .b-ctrl { justify-content: flex-start; }
      .hero-num { font-size: 52px; }
      .val { font-size: 26px; }
      .cmp-val { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="bento">

    <!-- Header -->
    <div class="bx b-hdr">
      <span class="logo">Code<span>Prune</span></span>
      <span class="live-chip"><span class="live-dot"></span>LIVE</span>
    </div>

    <!-- Controls -->
    <div class="bx b-ctrl">
      <div class="toggle-group">
        <button class="tgl on" id="btn-opt" onclick="setMode('optimized')">Optimized</button>
        <button class="tgl pass" id="btn-pass" onclick="setMode('passthrough')">Passthrough</button>
      </div>
    </div>

    <!-- Hero -->
    <div class="bx b-hero">
      <div class="hero-num" id="big-pct">0%</div>
      <div class="hero-tag">Total Token Savings</div>
    </div>

    <!-- Metric Cards -->
    <div class="bx b-sav">
      <div class="lbl"><span class="indicator emerald"></span>Tokens Saved</div>
      <div class="val c-emerald" id="saved">0</div>
      <div class="sub" id="saved-sub">&mdash;</div>
    </div>
    <div class="bx b-cost">
      <div class="lbl"><span class="indicator purple"></span>Cost Saved</div>
      <div class="val c-purple" id="cost">$0.00</div>
      <div class="sub">Sonnet $3 &middot; Opus $5 / Mtok</div>
    </div>
    <div class="bx b-reqs">
      <div class="lbl"><span class="indicator amber"></span>API Calls</div>
      <div class="val c-amber" id="requests">0</div>
      <div class="sub" id="req-sub">&mdash;</div>
    </div>
    <div class="bx b-mde">
      <div class="lbl"><span class="indicator blue"></span>Current Mode</div>
      <div class="val c-blue" id="mode-display">&mdash;</div>
      <div class="sub">Toggle to switch</div>
    </div>

    <!-- Bars -->
    <div class="bx b-bars">
      <div class="lbl" style="margin-bottom:16px">Input Token Comparison</div>
      <div class="bar-row">
        <div class="bar-tag c-rose">Without</div>
        <div class="bar-track">
          <div class="bar-fill without" id="bar-orig" style="width:100%">
            <span class="bar-num" id="bar-orig-val">0</span>
          </div>
        </div>
        <div class="bar-ext c-rose" id="bar-orig-lbl">0</div>
      </div>
      <div class="bar-row">
        <div class="bar-tag c-emerald">With</div>
        <div class="bar-track">
          <div class="bar-fill with" id="bar-opt" style="width:0%">
            <span class="bar-num" id="bar-opt-val">0</span>
          </div>
        </div>
        <div class="bar-ext c-emerald" id="bar-opt-lbl">0</div>
      </div>
    </div>

    <!-- Comparison A -->
    <div class="bx b-cmpA">
      <div class="cmp-head"><div class="cmp-dot" style="background:var(--emerald)"></div>With CodePrune</div>
      <div class="cmp-grid">
        <div><div class="cmp-lbl">Requests</div><div class="cmp-val c-emerald" id="c-o-req">0</div></div>
        <div><div class="cmp-lbl">Input Tokens</div><div class="cmp-val c-emerald" id="c-o-tok">0</div></div>
        <div><div class="cmp-lbl">Output Tokens</div><div class="cmp-val" id="c-o-out">0</div></div>
        <div><div class="cmp-lbl">Avg / Request</div><div class="cmp-val c-emerald" id="c-o-avg">0</div></div>
      </div>
    </div>

    <!-- Comparison B -->
    <div class="bx b-cmpB">
      <div class="cmp-head"><div class="cmp-dot" style="background:var(--rose)"></div>Without CodePrune</div>
      <div class="cmp-grid">
        <div><div class="cmp-lbl">Requests</div><div class="cmp-val c-rose" id="c-p-req">0</div></div>
        <div><div class="cmp-lbl">Input Tokens</div><div class="cmp-val c-rose" id="c-p-tok">0</div></div>
        <div><div class="cmp-lbl">Output Tokens</div><div class="cmp-val" id="c-p-out">0</div></div>
        <div><div class="cmp-lbl">Avg / Request</div><div class="cmp-val c-rose" id="c-p-avg">0</div></div>
      </div>
    </div>

    <!-- Log -->
    <div class="bx b-log">
      <div class="log-head">Request Log</div>
      <table>
        <thead><tr><th>Time</th><th>Mode</th><th>Model</th><th>Original</th><th>Optimized</th><th>Saved</th><th>Layers</th></tr></thead>
        <tbody id="log"><tr><td colspan="7" class="empty-row">Waiting for requests&hellip;</td></tr></tbody>
      </table>
    </div>

  </div>

  <script>
    function fmt(n){
      if(n>=1e6) return (n/1e6).toFixed(2)+'M';
      if(n>=1e3) return (n/1e3).toFixed(1)+'K';
      return String(n);
    }

    async function setMode(m){
      await fetch('/api/mode',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:m})});
      refresh();
    }

    async function refresh(){
      try{
        const [sR,cR,lR,mR]=await Promise.all([fetch('/api/stats'),fetch('/api/comparison'),fetch('/api/requests?limit=30'),fetch('/api/mode')]);
        const s=await sR.json(), c=await cR.json(), l=await lR.json(), m=await mR.json();

        // Mode
        document.getElementById('btn-opt').className='tgl'+(m.mode==='optimized'?' on':'');
        document.getElementById('btn-pass').className='tgl pass'+(m.mode==='passthrough'?' on':'');
        document.getElementById('mode-display').textContent=m.mode==='optimized'?'OPTIMIZED':'PASSTHROUGH';

        // Hero
        document.getElementById('big-pct').textContent=s.savingsPercent.toFixed(1)+'%';

        // Cards
        document.getElementById('saved').textContent=fmt(s.totalSaved);
        document.getElementById('saved-sub').textContent=fmt(s.totalInputOriginal)+' \\u2192 '+fmt(s.totalInputOptimized);
        document.getElementById('cost').textContent='$'+s.costSaved.toFixed(2);
        document.getElementById('requests').textContent=String(s.totalRequests);
        document.getElementById('req-sub').textContent=c.optimized.totalRequests+' opt \\u00b7 '+c.passthrough.totalRequests+' raw';

        // Bars
        var mx=Math.max(s.totalInputOriginal,1);
        document.getElementById('bar-orig').style.width='100%';
        document.getElementById('bar-opt').style.width=Math.max((s.totalInputOptimized/mx)*100,3)+'%';
        document.getElementById('bar-orig-lbl').textContent=fmt(s.totalInputOriginal);
        document.getElementById('bar-opt-lbl').textContent=fmt(s.totalInputOptimized);

        // Comparison
        var o=c.optimized,p=c.passthrough;
        document.getElementById('c-o-req').textContent=String(o.totalRequests);
        document.getElementById('c-o-tok').textContent=fmt(o.totalInputOptimized);
        document.getElementById('c-o-out').textContent=fmt(o.totalOutputTokens);
        document.getElementById('c-o-avg').textContent=o.totalRequests>0?fmt(Math.round(o.totalInputOptimized/o.totalRequests)):'0';
        document.getElementById('c-p-req').textContent=String(p.totalRequests);
        document.getElementById('c-p-tok').textContent=fmt(p.totalInputOriginal);
        document.getElementById('c-p-out').textContent=fmt(p.totalOutputTokens);
        document.getElementById('c-p-avg').textContent=p.totalRequests>0?fmt(Math.round(p.totalInputOriginal/p.totalRequests)):'0';

        // Log
        var tb=document.getElementById('log');
        if(l.length===0) return;
        var html='';
        for(var r of l){
          var sv=r.input_tokens_original-r.input_tokens_optimized;
          var pc=r.input_tokens_original>0?((sv/r.input_tokens_original)*100).toFixed(0):'0';
          var ops=[];try{ops=JSON.parse(r.optimizations||'[]')}catch{}
          var t=new Date(r.timestamp).toLocaleTimeString();
          var mdl=(r.model||'?').replace(/claude-/g,'').split('-').slice(0,2).join('-');
          var mo=r.mode||'optimized';
          var pl=mo==='optimized'?'<span class="pill opt">OPT</span>':'<span class="pill pass">RAW</span>';
          var sc=sv>0?'c-emerald':sv<0?'c-rose':'';

          html+='<tr>';
          html+='<td>'+t+'</td>';
          html+='<td>'+pl+'</td>';
          html+='<td>'+mdl+'</td>';
          html+='<td>'+fmt(r.input_tokens_original)+'</td>';
          html+='<td>'+fmt(r.input_tokens_optimized)+'</td>';
          html+='<td class="'+sc+'">'+fmt(sv)+' ('+pc+'%)</td>';
          html+='<td>';
          for(var tg of ops){
            var cl=tg.includes('clearing')?'t-green':tg.includes('truncat')?'t-blue':tg.includes('concise')?'t-purple':'t-amber';
            html+='<span class="tag '+cl+'">'+tg.replace(/_/g,' ')+'</span>';
          }
          if(ops.length===0) html+='<span style="color:var(--text-muted)">none</span>';
          html+='</td></tr>';
        }
        tb.textContent='';
        tb.insertAdjacentHTML('beforeend',html);
      }catch(e){console.error(e)}
    }

    refresh();
    setInterval(refresh,3000);
  </script>
</body>
</html>`;
}
