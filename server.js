const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let chunks = [];
  req.on('data', d => chunks.push(d));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const isWhisper = req.url.startsWith('/whisper');
    const hostname = isWhisper ? 'api.openai.com' : 'api.anthropic.com';
    const path = isWhisper ? req.url.replace('/whisper', '') : req.url;
    const headers = isWhisper
      ? {
          'Authorization': 'Bearer ' + process.env.OPENAI_KEY,
          'Content-Type': req.headers['content-type'],
          'Content-Length': body.length
        }
      : {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': body.length
        };

    const options = { hostname, path, method: req.method, headers };
    const proxyReq = https.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, { 'Access-Control-Allow-Origin': '*' });
      proxyRes.pipe(res);
    });
    proxyReq.on('error', e => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    });
    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, () => console.log('Prod.ai proxy running on port ' + PORT));
