// Compiled from status.quill — Status Page for arhan.dev
// Built with Quill x Cloudflare Workers

async function checkSite(site) {
  try {
    const start = Date.now();
    const res = await fetch(site.url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(5000) });
    const time = Date.now() - start;
    const up = res.status >= 200 && res.status < 400;
    return { name: site.name, url: site.url, up, time, status: res.status };
  } catch (e) {
    return { name: site.name, url: site.url, up: false, time: 0, status: 0 };
  }
}

function buildRow(r) {
  const dot = r.up ? "🟢" : "🔴";
  const statusText = r.up ? `${r.status}` : "Down";
  const timeText = r.up ? `${r.time}ms` : "—";
  const cls = r.up ? "up" : "down";
  return `<tr class="${cls}"><td class="site-cell">${dot} <a href="${r.url}" target="_blank">${r.name}</a></td><td>${statusText}</td><td>${timeText}</td></tr>`;
}

function page(bannerClass, bannerText, rows) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status — arhan.dev</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e0e0e0; min-height: 100vh; }
    .container { max-width: 720px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .subtitle { color: #888; margin-bottom: 32px; font-size: 14px; }
    .banner { padding: 16px 20px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 32px; }
    .banner-up { background: rgba(30, 185, 105, 0.12); color: #1EB969; border: 1px solid rgba(30, 185, 105, 0.25); }
    .banner-down { background: rgba(255, 75, 75, 0.12); color: #FF4B4B; border: 1px solid rgba(255, 75, 75, 0.25); }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #1a1a1a; }
    td { padding: 14px 16px; border-bottom: 1px solid #1a1a1a; font-size: 14px; }
    .site-cell { font-weight: 500; }
    .site-cell a { color: #e0e0e0; text-decoration: none; }
    .site-cell a:hover { color: #1EB969; }
    tr.up td:nth-child(2) { color: #1EB969; }
    tr.up td:nth-child(3) { color: #888; }
    tr.down td:nth-child(2) { color: #FF4B4B; }
    tr.down td:nth-child(3) { color: #555; }
    .footer { margin-top: 40px; text-align: center; color: #444; font-size: 13px; }
    .footer a { color: #1EB969; text-decoration: none; }
    .powered { margin-top: 12px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Status</h1>
    <p class="subtitle">Real-time monitoring for arhan.dev services</p>
    <div class="banner ${bannerClass}">${bannerText}</div>
    <table>
      <thead><tr><th>Service</th><th>Status</th><th>Response</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">
      <p>Powered by <a href="https://quill.tradebuddy.dev">Quill</a> x <a href="https://workers.cloudflare.com">Cloudflare Workers</a></p>
      <p class="powered">Checked from Cloudflare's nearest edge node</p>
    </div>
  </div>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const sites = [
      { name: "arhan.dev", url: "https://arhan.dev" },
      { name: "quill.tradebuddy.dev", url: "https://quill.tradebuddy.dev" },
      { name: "rewovenapp.com", url: "https://rewovenapp.com" },
      { name: "mytradebuddy.com", url: "https://mytradebuddy.com" },
      { name: "tradebuddy.dev", url: "https://tradebuddy.dev" },
      { name: "deepika.fit", url: "https://deepika.fit" }
    ];

    const results = await Promise.all(sites.map(checkSite));

    const totalUp = results.filter(r => r.up).length;
    const totalSites = results.length;
    const allUp = totalUp === totalSites;

    const bannerClass = allUp ? "banner-up" : "banner-down";
    const bannerText = allUp ? "All systems operational" : `${totalUp}/${totalSites} systems operational`;
    const rows = results.map(buildRow).join("");

    return new Response(page(bannerClass, bannerText, rows), {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};
