const fs = require('fs');
let c = fs.readFileSync('routes/payments.js', 'utf8');
c = c.replace(/\\'string\\'/g, "'string'");
fs.writeFileSync('routes/payments.js', c);
