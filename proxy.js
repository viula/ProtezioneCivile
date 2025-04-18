const http = require('http');
const https = require('https');
const url = require('url');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const queryObject = url.parse(req.url, true).query;
    const targetUrl = queryObject.url;

    if (!targetUrl) {
        res.writeHead(400);
        res.end('Missing URL parameter');
        return;
    }

    https.get(targetUrl, (proxyRes) => {
        let data = '';

        proxyRes.on('data', (chunk) => {
            data += chunk;
        });

        proxyRes.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    }).on('error', (err) => {
        res.writeHead(500);
        res.end('Proxy Error: ' + err.message);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});