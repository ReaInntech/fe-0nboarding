const fs = require('fs');
const env = fs.readFileSync('c:\\Users\\tamar\\Documents\\RealInovation.tech\\saslution\\fe-0nboarding\\.env', 'utf8');

let privateKey = '';
for (const line of env.split('\n')) {
  if (line.startsWith('FIREBASE_PRIVATE_KEY=')) {
    privateKey = line.substring('FIREBASE_PRIVATE_KEY='.length);
    break;
  }
}

function formatKey(keyStr) {
  let key = keyStr.replace(/^"|"$/g, '');
  const match = key.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/s);
  if (match) {
    // Remove literal '\n', literal '\', and all whitespace
    const base64 = match[1].replace(/\\n/g, '').replace(/\\/g, '').replace(/\s+/g, '');
    const formattedBase64 = base64.match(/.{1,64}/g)?.join('\n') || '';
    return `-----BEGIN PRIVATE KEY-----\n${formattedBase64}\n-----END PRIVATE KEY-----\n`;
  }
  return key;
}

const formatted = formatKey(privateKey);
const crypto = require('crypto');
try {
  const sign = crypto.createSign('SHA256');
  sign.update('test');
  sign.sign(formatted);
  console.log('Valid PEM! Crypto accepted it.');
} catch (e) {
  console.error('Crypto rejected it:', e.message);
}
