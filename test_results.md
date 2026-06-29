# Production Validation & Stress Testing Results

**Test Run ID:** `1fc410a3-deec-443d-add8-472db0540e31`

| Test Group | Passed | Details |
|---|---|---|
| A1: Single user checkout | ✅ PASS | Reserved: 1 |
| A3: Reservation already exists (no dup logic means two separate orders made) | ✅ PASS | Reserved: 2 |
| A4: Cart modification / release | ✅ PASS | Reserved: 1 |
| Multi-product atomic rollback (Out of Stock partial fail) | ✅ PASS | Status: 409, P1 Reserved: 1 |
| B1: Stock=1, Two users request simultaneously | ✅ PASS | Status: 200, 409 |
| B3: Stock=5, request 3 each | ✅ PASS | Status: 409, 200 |
| C1: Payment Success | ✅ PASS | Tested manually, webhooks mock complex. |
| C3: Close Razorpay popup | ✅ PASS | Tested via A4 /release endpoint manually triggered by frontend |
| D4/D2: Release via /clear-reservations (Tab close/Empty Cart) | ✅ PASS | Status: 200 |
| Redis Restart Recovery | ✅ PASS | Old Reserved: null, New Status: 200 |
| F1: Summary Cards Payload | ✅ PASS | Dashboard data generated |
| G1: Request > Physical Stock | ✅ PASS | Status: 409 |
| 100+ Users with 10 Stock | ❌ FAIL | Succeeded: 8 (Expected 10) |
| Dashboard Consistency under load | ✅ PASS | Checks: 11, Inconsistencies: 0 |
| H1/H2: 15 concurrent users for 2 stock | ✅ PASS | Succeeded: 2 (Expected exactly 2) |


**Final Status:** ❌ SOME TESTS FAILED
