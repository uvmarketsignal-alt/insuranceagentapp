const AUTH_SALT = 'UV_INS_2025_SECURE_SALT';

const hashPassword = (plain) => {
  if (!plain) return '';
  const SALT = AUTH_SALT;
  const salted = SALT + plain + SALT;
  let hash = 5381;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) + hash) ^ salted.charCodeAt(i);
    hash = hash & hash;
  }
  return `uv_hash_${Math.abs(hash)}`;
};

console.log('Owner:', hashPassword("UVT@Owner2026"));
console.log('Employee:', hashPassword("Vasu@Emp2026"));
