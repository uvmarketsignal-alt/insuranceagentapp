const fs = require('fs');
const file = fs.readFileSync('src/lib/db-service.ts', 'utf-8');

const updated = file.replace(/fetch\(/g, 'apiFetch(');

const wrapper = `
async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const mergedInit = {
    ...(init || {}),
    credentials: 'include' as RequestCredentials,
  };
  return fetch(input, mergedInit);
}
`;

const lines = updated.split('\n');
const importEndIndex = lines.findIndex(l => l.startsWith('export class'));

lines.splice(importEndIndex, 0, wrapper);

fs.writeFileSync('src/lib/db-service.ts', lines.join('\n'));
console.log('Refactored db-service.ts');
