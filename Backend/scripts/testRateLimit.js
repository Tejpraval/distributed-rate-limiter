const http = require('http');

const HOST = process.argv[2] || 'localhost';  // Read '3.6.86.173' from terminal
const API_KEY = process.argv[3] || 'test-basic-key';
const TOTAL_REQUESTS = 150; // Set to 150 to guarantee we trip the basic limit (100)
const PORT = 3000;
const PATH = '/api/external/test';


let completed = 0;
let successCount = 0;
let rateLimitedCount = 0;

console.log(`Starting validation test on ${HOST}:${PORT}`);
console.log(`Sending ${TOTAL_REQUESTS} concurrent requests with API Key: ${API_KEY}`);
console.log('---');

for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const req = http.request({
        host: HOST, // Opens connection directly to your remote AWS server
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
