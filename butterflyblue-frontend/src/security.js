const crypto = require('crypto');

function generateCSP() {
  const nonce = crypto.randomBytes(16).toString('base64');
  return `default-src 'none'; script-src 'self' 'nonce-${nonce}'`;
}

module.exports = generateCSP;
