const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');
const https = require('https');

const [,, serviceUrl, token, outputFile] = process.argv;

if (!serviceUrl || !token) {
  console.error('Usage: node scripts/download_db.js <service-url> <download-token> [output-file]');
  console.error('Example: node scripts/download_db.js https://my-service.onrender.com abc123 study_center.db');
  process.exit(1);
}

const parsedUrl = url.parse(serviceUrl);
const protocol = parsedUrl.protocol === 'https:' ? https : http;
const savePath = path.resolve(outputFile || 'study_center.db');
const endpoint = `${serviceUrl.replace(/\/$/, '')}/download-db?token=${encodeURIComponent(token)}`;

console.log(`Downloading database from: ${endpoint}`);
console.log(`Saving to: ${savePath}`);

const fileStream = fs.createWriteStream(savePath);

protocol.get(endpoint, (res) => {
  if (res.statusCode !== 200) {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.error(`Download failed: ${res.statusCode}`);
      console.error(body);
      process.exit(1);
    });
    return;
  }

  res.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Database downloaded successfully.');
  });
}).on('error', (err) => {
  fs.unlink(savePath, () => {});
  console.error('Request failed:', err.message);
  process.exit(1);
});
