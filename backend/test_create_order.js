const http = require('http');

const data = JSON.stringify({
  items: [{ product: '6a42d8283c697cc573bfecc1', quantity: 1, name: 'Test' }],
  shippingAddress: { houseNo: '1', street: '1', area: '1', city: '1', state: '1', pincode: '1', addressType: 'Home' },
  contactInformation: { fullName: 'Test', email: 'test@example.com', mobile: '9999999999' },
  user: '6a42d8283c697cc573bfecc1'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/payments/create-order',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
