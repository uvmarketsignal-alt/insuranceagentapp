async function test() {
  const loginRes = await fetch('http://localhost:5173/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'raghul@uvinsurance.in', password: 'Raghul@Emp2025' })
  });
  
  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie via Proxy:', cookieHeader);
  
  if (!cookieHeader) {
    console.log('No cookie returned via proxy. Aborting.');
    return;
  }
  
  const token = cookieHeader.split(';')[0];
  console.log('Sending Cookie via Proxy:', token);
  
  const reqRes = await fetch('http://localhost:5173/api/customers', {
    headers: { 'Cookie': token }
  });
  
  console.log('Customers Status via Proxy:', reqRes.status);
  console.log('Customers Body:', await reqRes.text());
}

test();
