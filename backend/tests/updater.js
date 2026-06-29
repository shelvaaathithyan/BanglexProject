const fs = require('fs');
let c = fs.readFileSync('stressTest.js', 'utf8');

const product3Line = "testProduct3 = await Product.create({ name: `P3_${testRunId}`, category: 'Test', price: 300, stock: 1, isTestData: true, testRunId });";
c = c.replace(product3Line, product3Line + "\n    testProduct4 = await Product.create({ name: `P4_${testRunId}`, category: 'Test', price: 400, stock: 0, isTestData: true, testRunId });\n    testProduct5 = await Product.create({ name: `P5_${testRunId}`, category: 'Test', price: 500, stock: 10, isTestData: true, testRunId });");

const groupBHeader = "console.log('\\n--- Group B: Concurrent Checkout ---');";
const multiProductTest = `
    // ----------------------------------------------------
    // TEST GROUP A2: MULTI-PRODUCT ROLLBACK
    // ----------------------------------------------------
    console.log('\\n--- Multi-product Rollback ---');
    const reqMulti = await createOrderReq(token1, testUser1, [
      { _id: testProduct1._id, quantity: 1, price: 100 }, 
      { _id: testProduct4._id, quantity: 1, price: 400 }
    ]);
    const p1ReservedAfterMulti = await redis.get(\`product:reserved:\${testProduct1._id}\`);
    recordResult('Multi-product atomic rollback (Out of Stock partial fail)', reqMulti.status === 409 && p1ReservedAfterMulti === '1', \`Status: \${reqMulti.status}, P1 Reserved: \${p1ReservedAfterMulti}\`);
`;
c = c.replace(groupBHeader, multiProductTest + "\n    " + groupBHeader);

const groupCHeader = "console.log('\\n--- Group C: Razorpay Behaviour ---');";
const paymentIdempotencyTest = `
    // ----------------------------------------------------
    // TEST GROUP C: RAZORPAY BEHAVIOUR & IDEMPOTENCY
    // ----------------------------------------------------
    console.log('\\n--- Payment Idempotency ---');
    const a1Order = await Order.findOne({ user: testUser1._id, orderNumber: { $exists: true } });
    if (a1Order && a1Order.gatewayOrderId) {
      const crypto = require('crypto');
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const rzpOrderId = a1Order.gatewayOrderId;
      const rzpPaymentId = "pay_test_" + crypto.randomBytes(4).toString('hex');
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(rzpOrderId + "|" + rzpPaymentId);
      const expectedSignature = hmac.digest('hex');

      const verifyPayload = {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: expectedSignature,
        orderId: a1Order._id
      };

      const reqVerify1 = await fetch(\`\${API_URL}/payments/verify-payment\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token1}\` },
        body: JSON.stringify(verifyPayload)
      });
      const resVerify1 = await reqVerify1.json();

      const reqVerify2 = await fetch(\`\${API_URL}/payments/verify-payment\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token1}\` },
        body: JSON.stringify(verifyPayload)
      });
      const resVerify2 = await reqVerify2.json();

      const paymentsCount = await Payment.countDocuments({ order: a1Order._id });
      const invoicesCount = await Invoice.countDocuments({ order: a1Order._id });
      recordResult('Payment Idempotency (Duplicate verify-payment)', resVerify1.success === true && resVerify2.message === 'Already processed' && paymentsCount === 1 && invoicesCount === 1, \`Payments: \${paymentsCount}, Invoices: \${invoicesCount}\`);
      
      // Tag test run data
      await Payment.updateMany({ order: a1Order._id }, { testRunId, isTestData: true });
      await Invoice.updateMany({ order: a1Order._id }, { testRunId, isTestData: true });
    }
`;
c = c.replace(groupCHeader, paymentIdempotencyTest);

const groupFHeader = "console.log('\\n--- Group F: Dashboard Validation ---');";
const redisRestartTest = `
    // ----------------------------------------------------
    // REDIS RESTART RECOVERY
    // ----------------------------------------------------
    console.log('\\n--- Redis Restart Recovery ---');
    const { execSync } = require('child_process');
    try {
      execSync('docker restart banglexproject-redis-1');
      await new Promise(r => setTimeout(r, 2000));
      
      const p1ReservedAfterRestart = await redis.get(\`product:reserved:\${testProduct1._id}\`);
      
      const reqRestart = await createOrderReq(token1, testUser1, [{ _id: testProduct1._id, quantity: 1, price: 100 }]);
      const resRestart = await reqRestart.json();
      if(resRestart.order) await Order.findByIdAndUpdate(resRestart.order._id, { isTestData: true, testRunId });
      
      recordResult('Redis Restart Recovery', p1ReservedAfterRestart === null && reqRestart.status === 200, \`Old Reserved: \${p1ReservedAfterRestart}, New Status: \${reqRestart.status}\`);
    } catch (e) {
      recordResult('Redis Restart Recovery', false, 'Error: ' + e.message);
    }
`;
c = c.replace(groupFHeader, redisRestartTest + "\n    " + groupFHeader);

const groupHHeader = "console.log('\\n--- Group H: Stress Tests ---');";
const hundredUserLoadTest = `
    // ----------------------------------------------------
    // 100+ USER LOAD & DASHBOARD CONSISTENCY
    // ----------------------------------------------------
    console.log('\\n--- 100+ User Load & Dashboard Consistency ---');
    const loadUsers = [];
    for(let i=0; i<100; i++) {
      const u = await User.create({ email: \`load\${i}_\${testRunId}@test.com\`, password: 'password', isTestData: true, testRunId });
      loadUsers.push(jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '1h' }));
    }
    
    let dashboardInconsistencies = 0;
    let dashboardChecks = 0;
    const interval = setInterval(async () => {
      try {
        const req = await fetch(\`\${API_URL}/api/inventory/dashboard\`);
        const res = await req.json();
        dashboardChecks++;
        if (!res.summary || res.summary.totalProducts === undefined) {
          dashboardInconsistencies++;
        }
      } catch (e) {}
    }, 200);

    const loadPromises = loadUsers.map(token => createOrderReq(token, testUser1, [{ _id: testProduct5._id, quantity: 1, price: 500 }]));
    const loadResults = await Promise.all(loadPromises);
    clearInterval(interval);

    for(let r of loadResults) {
      if (r.status === 200) {
         const js = await r.json();
         if(js.order) await Order.findByIdAndUpdate(js.order._id, { isTestData: true, testRunId });
      }
    }
    const successfulLoad = loadResults.filter(r => r.status === 200).length;
    recordResult('100+ Users with 10 Stock', successfulLoad === 10, \`Succeeded: \${successfulLoad} (Expected 10)\`);
    recordResult('Dashboard Consistency under load', dashboardChecks > 0 && dashboardInconsistencies === 0, \`Checks: \${dashboardChecks}, Inconsistencies: \${dashboardInconsistencies}\`);
`;
c = c.replace(groupHHeader, hundredUserLoadTest + "\n    " + groupHHeader);

const testProductsArray = "const testProducts = [testProduct1, testProduct2, testProduct3];";
c = c.replace(testProductsArray, "const testProducts = [testProduct1, testProduct2, testProduct3, testProduct4, testProduct5];");

fs.writeFileSync('stressTest.js', c);
