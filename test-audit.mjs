async function test() {
  const loginRes = await fetch('http://localhost:5173/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'raghul@uvinsurance.in', password: 'Raghul@Emp2025' })
  });
  
  const cookieHeader = loginRes.headers.get('set-cookie');
  if (!cookieHeader) {
    console.log('No cookie returned via proxy. Aborting.');
    return;
  }
  
  const token = cookieHeader.split(';')[0];
  console.log('Got Auth Cookie');
  
  const reqRes = await fetch('http://localhost:5173/api/audit_logs', {
    method: 'POST',
    headers: { 
      'Cookie': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tenant_id: 'tenant_002',
      user_id: 'profile_002',
      action: 'create',
      entity_type: 'customer',
      entity_id: 'test_cust_1',
      details: 'Test customer creation via script'
    })
  });
  
  console.log('Audit Logs POST Status:', reqRes.status);
  console.log('Audit Logs POST Body:', await reqRes.text());
}

test();
