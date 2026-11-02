const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let results = [];

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/report') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            console.log('\n=== BROWSER REPORT ===');
            console.log(body);
            console.log('======================\n');
            res.writeHead(200);
            res.end('OK');
            setTimeout(() => process.exit(0), 500);
        });
        return;
    }

    let filePath = '.' + req.url.split('?')[0];
    if (filePath === './') filePath = './index.html';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            const ext = path.extname(filePath);
            const contentTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.png': 'image/png',
                '.svg': 'image/svg+xml'
            };
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
            res.end(data);
        }
    });
});

server.listen(8096, () => {
    console.log('Server on 8096');
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    spawn(chromePath, ['--headless=new', 'http://localhost:8096/']);
});

