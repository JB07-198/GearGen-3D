const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
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

server.listen(8091, () => {
    console.log('Server started on 8091');
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9223',
        'http://localhost:8091'
    ]);

    setTimeout(() => {
        http.get('http://localhost:9223/json', (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                const list = JSON.parse(data);
                const page = list.find(p => p.type === 'page');
                console.log('Page ws url:', page.webSocketDebuggerUrl);

                const ws = new (require('ws') || class {})(page.webSocketDebuggerUrl);
                // If ws package not installed, we can evaluate via simple test script
            });
        }).on('error', e => console.error('CDP error:', e));
    }, 1500);
});

