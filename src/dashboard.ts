export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodePrune</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #FAFAFA;
      --surface: #FFFFFF;
      --surface-alt: #F3F4F6;
      --text: #111;
      --text-dim: #666;
      --text-muted: #999;
      --yellow: #EAB308;
      --yellow-dark: #CA8A04;
      --yellow-dim: #FEF9C3;
      --red: #DC2626;
      --red-dim: #FEE2E2;
      --font: 'Inter', -apple-system, system-ui, sans-serif;
      --mono: 'JetBrains Mono', 'Fira Code', monospace;
      --radius: 16px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 20px;
      -webkit-font-smoothing: antialiased;
    }

    /* ─── Grid + Gradient Overlay ─── */
    .bg-grid {
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
      z-index: 0;
    }
    .bg-glow {
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 700px 500px at 10% 5%, rgba(234,179,8,0.08) 0%, transparent 70%),
        radial-gradient(ellipse 600px 600px at 85% 20%, rgba(234,179,8,0.05) 0%, transparent 70%),
        radial-gradient(ellipse 500px 400px at 50% 85%, rgba(0,0,0,0.02) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    /* ─── Bento Grid ─── */
    .bento {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 12px;
      max-width: 1360px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
      grid-template-areas:
        "hdr   hdr   hdr   hdr   hdr   hdr   hdr   hdr   hdr   ctrl  ctrl  ctrl"
        "hero  hero  hero  hero  sav   sav   sav   sav   cost  cost  cost  cost"
        "hero  hero  hero  hero  reqs  reqs  reqs  reqs  mde   mde   mde   mde"
        "bars  bars  bars  bars  bars  bars  bars  bars  bars  bars  bars  bars"
        "cmpA  cmpA  cmpA  cmpA  cmpA  cmpA  cmpB  cmpB  cmpB  cmpB  cmpB  cmpB"
        "log   log   log   log   log   log   log   log   log   log   log   log";
    }

    /* ─── Block ─── */
    .bx {
      background: var(--surface);
      border: none;
      border-radius: var(--radius);
      padding: 22px;
      transition: transform 0.2s, background 0.2s;
    }
    .bx:hover {
      transform: translateY(-2px);
      background: var(--surface-alt);
    }

    /* ─── Header ─── */
    .b-hdr {
      grid-area: hdr; background: none; padding: 0 4px;
      display: flex; align-items: center; gap: 14px;
    }
    .b-hdr:hover { transform: none; background: none; }
    .logo { font-size: 24px; font-weight: 900; color: var(--text); letter-spacing: -0.5px; }
    .logo span { color: var(--yellow); }
    .chip {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--yellow-dim); color: var(--yellow);
      font-size: 10px; font-weight: 800;
      padding: 4px 12px; border-radius: 20px;
      letter-spacing: 1px;
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--yellow); animation: blink 2s infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

    /* ─── Controls ─── */
    .b-ctrl {
      grid-area: ctrl; background: none; padding: 0;
      display: flex; align-items: center; justify-content: flex-end;
    }
    .b-ctrl:hover { transform: none; background: none; }
    .tog { display: inline-flex; gap: 2px; background: var(--surface); border-radius: 10px; padding: 3px; }
    .tb {
      padding: 7px 16px; border-radius: 8px; border: none; cursor: pointer;
      font-family: var(--font); font-size: 11px; font-weight: 700;
      background: transparent; color: var(--text-muted); transition: all 0.2s;
      letter-spacing: 0.3px;
    }
    .tb:hover { color: var(--text); }
    .tb.on { background: var(--yellow); color: #000; }
    .tb.p.on { background: var(--text); color: #fff; }

    /* ─── Hero ─── */
    .b-hero {
      grid-area: hero;
      background: var(--text);
      text-align: center;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .hero-n {
      font-family: var(--mono); font-size: 56px; font-weight: 800;
      color: var(--yellow); line-height: 1; letter-spacing: -2px;
    }
    .hero-t {
      font-size: 10px; font-weight: 700; color: #aaa;
      margin-top: 8px; letter-spacing: 3px; text-transform: uppercase;
    }

    /* ─── Stat Cards ─── */
    .b-sav  { grid-area: sav;  background: var(--yellow); }
    .b-cost { grid-area: cost; background: var(--surface); }
    .b-reqs { grid-area: reqs; background: var(--surface); }
    .b-mde  { grid-area: mde;  background: var(--surface); }

    .b-sav .lbl { color: #000; }
    .b-sav .val { color: #000; }
    .b-sav .sub { color: #333; }

    .b-sav:hover  { background: #D69E2E; }
    .b-cost:hover { background: var(--surface-alt); }
    .b-reqs:hover { background: var(--surface-alt); }

    .lbl {
      font-size: 10px; font-weight: 700; color: var(--text-dim);
      text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;
    }
    .val {
      font-family: var(--mono); font-size: 34px; font-weight: 800;
      line-height: 1; letter-spacing: -1px;
    }
    .sub { font-size: 11px; color: var(--text-muted); margin-top: 8px; font-family: var(--mono); }
    .c-yellow { color: var(--green); }
    .c-black { color: var(--text); }
    .c-red   { color: var(--red); }
    .c-yellow { color: var(--yellow); }

    /* ─── Bars ─── */
    .b-bars { grid-area: bars; }
    .bar-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .bar-row:last-child { margin-bottom: 0; }
    .bar-tag { min-width: 80px; text-align: right; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
    .bar-track { flex: 1; height: 40px; background: #EFEFEF; border-radius: 10px; overflow: hidden; position: relative; }
    .bar-fill { height: 100%; border-radius: 10px; transition: width 0.8s cubic-bezier(0.16,1,0.3,1); position: relative; }
    .bar-fill.w { background: var(--text); }
    .bar-fill.o { background: var(--yellow); }
    .bar-num {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      font-family: var(--mono); font-size: 13px; font-weight: 800;
      color: #000; text-shadow: none;
    }
    .bar-fill.w .bar-num { color: #fff; }
    .bar-ext { min-width: 80px; font-family: var(--mono); font-size: 13px; font-weight: 700; }

    /* ─── Comparison ─── */
    .b-cmpA { grid-area: cmpA; background: var(--surface); }
    .b-cmpB { grid-area: cmpB; background: var(--surface); }
    .b-cmpA:hover { background: var(--surface-alt); }
    .b-cmpB:hover { background: var(--surface-alt); }
    .cmp-h { font-size: 13px; font-weight: 800; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.3px; }
    .cmp-d { width: 10px; height: 10px; border-radius: 3px; }
    .cmp-g { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .cmp-l { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
    .cmp-v { font-family: var(--mono); font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }

    /* ─── Log ─── */
    .b-log { grid-area: log; overflow-x: auto; }
    .log-h { font-size: 14px; font-weight: 800; margin-bottom: 14px; letter-spacing: 0.3px; }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; padding: 8px 10px;
      font-size: 10px; font-weight: 800; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 1.5px;
      border-bottom: 2px solid #E5E7EB;
    }
    td {
      padding: 9px 10px; border-bottom: 1px solid #F3F4F6;
      font-family: var(--mono); font-size: 12px; color: var(--text-dim);
    }
    tr:hover td { background: #F9FAFB; color: var(--text); }
    .pill {
      display: inline-block; padding: 3px 8px; border-radius: 6px;
      font-size: 9px; font-weight: 800; letter-spacing: 0.5px; font-family: var(--font);
    }
    .pill.ok { background: var(--yellow); color: #000; }
    .pill.rw { background: var(--text); color: #fff; }
    .tag {
      display: inline-block; padding: 3px 8px; border-radius: 6px;
      font-size: 9px; font-weight: 700; margin: 1px; font-family: var(--font);
    }
    .tag.g { background: var(--yellow-dim); color: var(--yellow); }
    .tag.b { background: #F3F4F6; color: var(--text); }
    .tag.a { background: #F3F4F6; color: var(--text-dim); }
    .empty-r { text-align: center; padding: 48px; color: var(--text-muted); font-family: var(--font); font-size: 13px; }

    /* ─── Responsive ─── */
    @media (max-width: 1024px) {
      .bento {
        grid-template-columns: repeat(6, 1fr);
        grid-template-areas:
          "hdr   hdr   hdr   ctrl  ctrl  ctrl"
          "hero  hero  hero  sav   sav   sav"
          "cost  cost  cost  reqs  reqs  reqs"
          "mde   mde   mde   mde   mde   mde"
          "bars  bars  bars  bars  bars  bars"
          "cmpA  cmpA  cmpA  cmpB  cmpB  cmpB"
          "log   log   log   log   log   log";
      }
    }
    @media (max-width: 640px) {
      body { padding: 10px; }
      .bento {
        grid-template-columns: 1fr;
        grid-template-areas: "hdr" "ctrl" "hero" "sav" "cost" "reqs" "mde" "bars" "cmpA" "cmpB" "log";
        gap: 10px;
      }
      .b-ctrl { justify-content: flex-start; }
      .hero-n { font-size: 40px; letter-spacing: -1px; }
      .val { font-size: 26px; }
      .cmp-v { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="bg-glow"></div>
  <div class="bento">

    <div class="bx b-hdr">
      <span class="logo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px;color:var(--yellow)"><path d="M12 3v18"/><path d="m8 8 4-5 4 5"/><path d="m8 16 4 5 4-5"/><line x1="3" y1="12" x2="21" y2="12"/></svg>Code<span>Prune</span></span>
      <span class="chip"><span class="dot"></span>LIVE</span>
    </div>

    <div class="bx b-ctrl">
      <div class="tog">
        <button class="tb on" id="btn-opt" onclick="setMode('optimized')">Optimized</button>
        <button class="tb p" id="btn-pass" onclick="setMode('passthrough')">Passthrough</button>
      </div>
    </div>

    <div class="bx b-hero">
      <div class="hero-n" id="big-pct">0%</div>
      <div class="hero-t">Total Token Savings</div>
    </div>

    <div class="bx b-sav">
      <div class="lbl"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>Tokens Saved</div>
      <div class="val c-yellow" id="saved">0</div>
      <div class="sub" id="saved-sub">&mdash;</div>
    </div>
    <div class="bx b-cost">
      <div class="lbl"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Cost Saved</div>
      <div class="val c-black" id="cost">$0.00</div>
      <div class="sub">sonnet $3 / opus $5 per Mtok</div>
    </div>
    <div class="bx b-reqs">
      <div class="lbl"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>API Calls</div>
      <div class="val c-yellow" id="requests">0</div>
      <div class="sub" id="req-sub">&mdash;</div>
    </div>
    <div class="bx b-mde">
      <div class="lbl"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m8.66-13.5-5.2 3m-5.92 3-5.2 3M1.34 4.5l5.2 3m5.92 3 5.2 3"/></svg>Mode</div>
      <div class="val c-black" id="mode-display">&mdash;</div>
      <div class="sub">toggle to switch</div>
    </div>

    <div class="bx b-bars">
      <div class="lbl" style="margin-bottom:18px">Input Token Comparison</div>
      <div class="bar-row">
        <div class="bar-tag c-red">Without</div>
        <div class="bar-track"><div class="bar-fill w" id="bar-orig" style="width:100%"><span class="bar-num" id="bar-orig-val">0</span></div></div>
        <div class="bar-ext c-red" id="bar-orig-lbl">0</div>
      </div>
      <div class="bar-row">
        <div class="bar-tag c-yellow">With</div>
        <div class="bar-track"><div class="bar-fill o" id="bar-opt" style="width:0%"><span class="bar-num" id="bar-opt-val">0</span></div></div>
        <div class="bar-ext c-yellow" id="bar-opt-lbl">0</div>
      </div>
    </div>

    <div class="bx b-cmpA">
      <div class="cmp-h"><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--yellow)" stroke="none" style="vertical-align:-2px"><circle cx="12" cy="12" r="6"/></svg> With CodePrune</div>
      <div class="cmp-g">
        <div><div class="cmp-l">Requests</div><div class="cmp-v c-yellow" id="c-o-req">0</div></div>
        <div><div class="cmp-l">Input Tokens</div><div class="cmp-v c-yellow" id="c-o-tok">0</div></div>
        <div><div class="cmp-l">Output Tokens</div><div class="cmp-v c-black" id="c-o-out">0</div></div>
        <div><div class="cmp-l">Avg / Request</div><div class="cmp-v c-yellow" id="c-o-avg">0</div></div>
      </div>
    </div>

    <div class="bx b-cmpB">
      <div class="cmp-h"><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text)" stroke="none" style="vertical-align:-2px"><circle cx="12" cy="12" r="6"/></svg> Without CodePrune</div>
      <div class="cmp-g">
        <div><div class="cmp-l">Requests</div><div class="cmp-v c-red" id="c-p-req">0</div></div>
        <div><div class="cmp-l">Input Tokens</div><div class="cmp-v c-red" id="c-p-tok">0</div></div>
        <div><div class="cmp-l">Output Tokens</div><div class="cmp-v c-black" id="c-p-out">0</div></div>
        <div><div class="cmp-l">Avg / Request</div><div class="cmp-v c-red" id="c-p-avg">0</div></div>
      </div>
    </div>

    <div class="bx b-log">
      <div class="log-h">Request Log</div>
      <table>
        <thead><tr><th>Time</th><th>Mode</th><th>Model</th><th>Original</th><th>Optimized</th><th>Saved</th><th>Layers</th></tr></thead>
        <tbody id="log"><tr><td colspan="7" class="empty-r">Waiting for requests&hellip;</td></tr></tbody>
      </table>
    </div>

  </div>

  <script>
    function fmt(n){if(n>=1e6)return(n/1e6).toFixed(2)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return String(n)}

    async function setMode(m){
      await fetch('/api/mode',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:m})});
      refresh();
    }

    async function refresh(){
      try{
        const[sR,cR,lR,mR]=await Promise.all([fetch('/api/stats'),fetch('/api/comparison'),fetch('/api/requests?limit=30'),fetch('/api/mode')]);
        const s=await sR.json(),c=await cR.json(),l=await lR.json(),m=await mR.json();

        document.getElementById('btn-opt').className='tb'+(m.mode==='optimized'?' on':'');
        document.getElementById('btn-pass').className='tb p'+(m.mode==='passthrough'?' on':'');
        document.getElementById('mode-display').textContent=m.mode==='optimized'?'OPTIMIZED':'PASSTHROUGH';

        document.getElementById('big-pct').textContent=s.savingsPercent.toFixed(1)+'%';
        document.getElementById('saved').textContent=fmt(s.totalSaved);
        document.getElementById('saved-sub').textContent=fmt(s.totalInputOriginal)+' \\u2192 '+fmt(s.totalInputOptimized);
        document.getElementById('cost').textContent='$'+s.costSaved.toFixed(2);
        document.getElementById('requests').textContent=String(s.totalRequests);
        document.getElementById('req-sub').textContent=c.optimized.totalRequests+' opt \\u00b7 '+c.passthrough.totalRequests+' raw';

        var mx=Math.max(s.totalInputOriginal,1);
        document.getElementById('bar-orig').style.width='100%';
        document.getElementById('bar-opt').style.width=Math.max((s.totalInputOptimized/mx)*100,3)+'%';
        document.getElementById('bar-orig-lbl').textContent=fmt(s.totalInputOriginal);
        document.getElementById('bar-opt-lbl').textContent=fmt(s.totalInputOptimized);

        var o=c.optimized,p=c.passthrough;
        document.getElementById('c-o-req').textContent=String(o.totalRequests);
        document.getElementById('c-o-tok').textContent=fmt(o.totalInputOptimized);
        document.getElementById('c-o-out').textContent=fmt(o.totalOutputTokens);
        document.getElementById('c-o-avg').textContent=o.totalRequests>0?fmt(Math.round(o.totalInputOptimized/o.totalRequests)):'0';
        document.getElementById('c-p-req').textContent=String(p.totalRequests);
        document.getElementById('c-p-tok').textContent=fmt(p.totalInputOriginal);
        document.getElementById('c-p-out').textContent=fmt(p.totalOutputTokens);
        document.getElementById('c-p-avg').textContent=p.totalRequests>0?fmt(Math.round(p.totalInputOriginal/p.totalRequests)):'0';

        var tb=document.getElementById('log');
        if(l.length===0)return;
        var h='';
        for(var r of l){
          var sv=r.input_tokens_original-r.input_tokens_optimized;
          var pc=r.input_tokens_original>0?((sv/r.input_tokens_original)*100).toFixed(0):'0';
          var ops=[];try{ops=JSON.parse(r.optimizations||'[]')}catch{}
          var t=new Date(r.timestamp).toLocaleTimeString();
          var md=(r.model||'?').replace(/claude-/g,'').split('-').slice(0,2).join('-');
          var mo=r.mode||'optimized';
          var pl=mo==='optimized'?'<span class="pill ok">OPT</span>':'<span class="pill rw">RAW</span>';
          var sc=sv>0?'c-yellow':sv<0?'c-red':'';

          h+='<tr>';
          h+='<td>'+t+'</td>';
          h+='<td>'+pl+'</td>';
          h+='<td>'+md+'</td>';
          h+='<td>'+fmt(r.input_tokens_original)+'</td>';
          h+='<td>'+fmt(r.input_tokens_optimized)+'</td>';
          h+='<td class="'+sc+'">'+fmt(sv)+' ('+pc+'%)</td>';
          h+='<td>';
          for(var tg of ops){
            var cl=tg.includes('clearing')?'g':tg.includes('truncat')?'b':'a';
            h+='<span class="tag '+cl+'">'+tg.replace(/_/g,' ')+'</span>';
          }
          if(ops.length===0)h+='<span style="color:var(--text-muted)">none</span>';
          h+='</td></tr>';
        }
        tb.textContent='';
        tb.insertAdjacentHTML('beforeend',h);
      }catch(e){console.error(e)}
    }

    refresh();
    setInterval(refresh,3000);
  </script>
</body>
</html>`;
}
