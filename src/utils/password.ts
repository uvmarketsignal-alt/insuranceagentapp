// Secure password hashing using a deterministic algorithm
// In production, use bcrypt on the server side

const SALT = 'UV_INS_2025_SECURE_SALT';

export const hashPassword = (input: string): string => {
  const salted = SALT + input + SALT;
  let hash = 5381;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) + hash) ^ salted.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `uv_hash_${Math.abs(hash)}`;
};

export const verifyPassword = (plain: string, hashed: string): boolean => {
  if (!plain || !hashed) return false;
  // Direct comparison fallback for plain passwords
  if (!hashed.startsWith('uv_hash_')) {
    return plain === hashed;
  }
  return hashPassword(plain) === hashed;
};

// Pre-compute hashes for known passwords
export const KNOWN_HASHES: Record<string, string> = {
  'UV@Owner2025': hashPassword('UV@Owner2025'),
  'Raghul@Emp2025': hashPassword('Raghul@Emp2025'),
  'Vasu@Emp2025': hashPassword('Vasu@Emp2025'),
};

export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters required');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter required');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter required');
  if (!/[0-9]/.test(password)) errors.push('At least one number required');
  if (!/[!@#$%^&*]/.test(password)) errors.push('At least one special character required');
  return { valid: errors.length === 0, errors };
};
