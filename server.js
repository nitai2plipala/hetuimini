const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8084;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // ===== API 接口 =====
    if (pathname === '/api/repos') {
        const repos = [
            { id: 1, name: 'hetuimini', price: 0, stars: 128 },
            { id: 2, name: 'vue-core', price: 0, stars: 200000 },
            { id: 3, name: 'react-hooks', price: 0, stars: 180000 },
            { id: 4, name: 'svelte-kit', price: 0, stars: 75000 }
        ];
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(repos), 'utf-8');
        return;
    }

    // ===== 静态文件服务 =====
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './test-hetuimini.html';
    }

    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'text/html';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop');
});