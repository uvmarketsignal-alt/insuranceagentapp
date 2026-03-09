const fetch = require('node-fetch') || global.fetch;

async function test() {
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'raghul@uvinsurance.in', password: 'Raghul@Emp2025' })
  });
  
  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie:', cookieHeader);
  
  if (!cookieHeader) {
    console.log('No cookie returned. Aborting.');
    return;
  }
  
  const token = cookieHeader.split(';')[0];
  console.log('Sending Cookie:', token);
  
  const reqRes = await fetch('http://localhost:3001/api/customers', {
    headers: { 'Cookie': token }
  });
  
  console.log('Customers Status:', reqRes.status);
  console.log('Customers Body:', await reqRes.text());
}

test();
