const http = require('http');

const TOTAL_REQUESTS = 120;
const HOST = 'localhost';
const PORT = 3000;
const PATH = '/api/test';

const API_KEY = 'test-basic-key';

let completed = 0;
let successCount = 0;
let rateLimitedCount = 0;

console.log(`Starting load test for Phase 2. Sending ${TOTAL_REQUESTS} requests with API Key ${API_KEY}...`);

for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const req = http.request({
        host: HOST,
        port: PORT,
        path: PATH,
        method: 'GET',
        headers: {
            'x-api-key': API_KEY
        }
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                successCount++;
            } else if (res.statusCode === 429) {
                rateLimitedCount++;
            } else {
                console.log(`Unexpected status: ${res.statusCode} - ${body}`);
            }
            
            completed++;
            if (completed === TOTAL_REQUESTS) {
                console.log('\n--- Test Results ---');
                console.log(`Total Requests: ${TOTAL_REQUESTS}`);
                console.log(`Successful (200): ${successCount}`);
                console.log(`Rate Limited (429): ${rateLimitedCount}`);
                console.log('--------------------');
            }
        });
    });

    req.on('error', (err) => {
        console.error(`Request ${i} error: ${err.message}`);
        completed++;
    });

    req.end();
}
