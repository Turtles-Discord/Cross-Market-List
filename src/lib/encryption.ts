import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * Encrypts sensitive data for storage in the database
 * @param data The data to encrypt (object or string)
 * @param userId The user ID to use as part of the encryption key
 * @returns Encrypted data object with iv, salt, and encrypted data
 */
export async function createEncryptedData(
  data: Record<string, any> | string,
  userId: string
) {
  // Create a salt
  const salt = randomBytes(16).toString('hex');
  
  // Create a secure key using scrypt with the user ID and salt
  const key = scryptSync(process.env.ENCRYPTION_SECRET + userId, salt, 32);
  
  // Create an initialization vector
  const iv = randomBytes(16);
  
  // Create a cipher
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  
  // Convert data to string if it's an object
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  
  // Encrypt the data
  let encrypted = cipher.update(stringData, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return the encrypted data with the iv and salt
  return {
    iv: iv.toString('hex'),
    salt,
    data: encrypted,
  };
}

/**
 * Decrypts data that was encrypted with createEncryptedData
 * @param encryptedData The encrypted data object with iv, salt, and data
 * @param userId The user ID used to encrypt the data
 * @returns The decrypted data (parsed as JSON if it was an object)
 */
export async function decryptData(
  encryptedData: { iv: string; salt: string; data: string },
  userId: string
) {
  // Create the key using the same process as during encryption
  const key = scryptSync(
    process.env.ENCRYPTION_SECRET + userId,
    encryptedData.salt,
    32
  );
  
  // Convert the iv from hex to Buffer
  const iv = Buffer.from(encryptedData.iv, 'hex');
  
  // Create a decipher
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  
  // Decrypt the data
  let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  // Try to parse the data as JSON
  try {
    return JSON.parse(decrypted);
  } catch (e) {
    // If parsing fails, return the string
    return decrypted;
  }
}

/**
 * Simplified function to securely hash a password
 * @param password The password to hash
 * @returns The hashed password with salt
 */
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a hash created with hashPassword
 * @param password The password to verify
 * @param hashedPassword The hash from hashPassword
 * @returns Whether the password is correct
 */
export function verifyPassword(password: string, hashedPassword: string) {
  const [salt, hash] = hashedPassword.split(':');
  const passwordHash = scryptSync(password, salt, 64).toString('hex');
  return passwordHash === hash;
} 