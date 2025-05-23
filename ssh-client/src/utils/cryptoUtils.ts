// This utility provides functions for encryption and decryption.
// IMPORTANT: These functions are designed to run in a Node.js environment (e.g., Electron main process)
// because they use the built-in 'crypto' module from Node.js.
// They will not work directly in a typical browser renderer process without polyfills or shims,
// and even then, performance and security might be concerns.

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // For AES-256
const IV_LENGTH = 16; // For AES-CBC

/**
 * NOTE: This function is intended for a Node.js environment (e.g., Electron main process).
 * Derives a 32-byte key from a password and salt using PBKDF2.
 * @param {string} password - The password to derive the key from.
 * @param {string} salt - A salt value (should be unique and stored securely).
 * @returns {Buffer} A 32-byte Buffer representing the derived key.
 */
export function generateKeyFromPassword(password: string, salt: string): Buffer {
  if (!password || !salt) {
    throw new Error('Password and salt are required to generate a key.');
  }
  // Parameters for PBKDF2:
  // iterations: Higher is more secure but slower. Choose a reasonable value.
  // keylen: 32 bytes for AES-256.
  // digest: Hashing algorithm. SHA-512 is a common choice.
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * NOTE: This function is intended for a Node.js environment (e.g., Electron main process).
 * Encrypts text using AES-256-CBC.
 * The secretKey must be 32 bytes.
 * @param {string} text - The text to encrypt.
 * @param {Buffer} secretKey - The 32-byte secret key for encryption.
 * @returns {string} A string containing the IV and encrypted data, separated by a colon (e.g., "iv_hex:encrypted_hex").
 * @throws {Error} If secretKey is not 32 bytes or if encryption fails.
 */
export function encrypt(text: string, secretKey: Buffer): string {
  if (secretKey.length !== KEY_LENGTH) {
    throw new Error(`Secret key must be ${KEY_LENGTH} bytes long.`);
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Encryption process failed.');
  }
}

/**
 * NOTE: This function is intended for a Node.js environment (e.g., Electron main process).
 * Decrypts text that was encrypted with AES-256-CBC and formatted as "iv_hex:encrypted_hex".
 * The secretKey must be 32 bytes.
 * @param {string} encryptedDataWithIv - The encrypted data string (IV + encrypted text, hex encoded, colon separated).
 * @param {Buffer} secretKey - The 32-byte secret key for decryption.
 * @returns {string} The decrypted text.
 * @throws {Error} If secretKey is not 32 bytes, if the input format is invalid, or if decryption fails.
 */
export function decrypt(encryptedDataWithIv: string, secretKey: Buffer): string {
  if (secretKey.length !== KEY_LENGTH) {
    throw new Error(`Secret key must be ${KEY_LENGTH} bytes long.`);
  }

  try {
    const parts = encryptedDataWithIv.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format. Expected "iv:encrypted_data".');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');

    if (iv.length !== IV_LENGTH) {
        throw new Error(`Invalid IV length. Expected ${IV_LENGTH} bytes.`);
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    // Avoid leaking too much detail about the error in production for security reasons
    if (error instanceof Error && (error.message.includes('Invalid IV length') || error.message.includes('Invalid encrypted data format'))) {
        throw error;
    }
    throw new Error('Decryption process failed. Check key or data integrity.');
  }
}

/*
// --- Conceptual Testing ---
// This code is intended to be run in a Node.js environment.

(async () => {
  if (typeof process === 'object' && process.versions && process.versions.node) {
    // Only run test if in a Node-like environment (very basic check)
    try {
      console.log('Running conceptual crypto test...');

      // 1. Generate a salt (in a real app, store this per user or per encrypted item securely)
      const salt = crypto.randomBytes(16).toString('hex');
      console.log('Salt:', salt);

      // 2. Derive a key from a master password and the salt
      const masterPassword = 'supersecretpassword123';
      const derivedKey = generateKeyFromPassword(masterPassword, salt);
      console.log('Derived Key (Buffer length):', derivedKey.length);

      // 3. Original text
      const originalText = 'This is a highly secret message!';
      console.log('Original Text:', originalText);

      // 4. Encrypt
      const encryptedPayload = encrypt(originalText, derivedKey);
      console.log('Encrypted Payload:', encryptedPayload);

      // 5. Decrypt
      const decryptedText = decrypt(encryptedPayload, derivedKey);
      console.log('Decrypted Text:', decryptedText);

      // 6. Verify
      if (originalText === decryptedText) {
        console.log('Test PASSED: Original and decrypted texts match.');
      } else {
        console.error('Test FAILED: Texts do not match!');
      }
    } catch (e) {
      console.error('Conceptual test failed:', e);
    }
  } else {
    console.warn('Skipping crypto conceptual test: Not in a Node.js-like environment.');
  }
})();

// --- Security Notes ---
// 1. Key Management: The security of this encryption heavily depends on the secrecy of the `secretKey`.
//    How this key is generated, stored, and retrieved is critical.
//    - The `generateKeyFromPassword` function is a step towards deriving a key from user input,
//      but the master password itself needs to be handled carefully.
//    - Storing derived keys or master passwords requires robust security measures (e.g., OS keychain,
//      hardware security modules, or for Electron, main process secure storage).
// 2. Salt: When using password-based key derivation (like PBKDF2 in `generateKeyFromPassword`),
//    the salt should be unique for each password being hashed/key being derived. It does not need to be secret,
//    but it should be stored alongside the encrypted data or derived key.
// 3. IV (Initialization Vector): The IV should be random for each encryption operation.
//    It is not secret and is typically prepended to the ciphertext, as done here.
//    Reusing IVs with the same key can severely weaken AES-CBC encryption.
// 4. Algorithm Choice: AES-256-CBC is a strong symmetric algorithm. Ensure it's appropriate for your use case.
//    Consider authenticated encryption modes like AES-GCM if you need both confidentiality and integrity protection
//    without manually implementing HMACs. (crypto.createCipheriv and createDecipheriv support GCM).
// 5. Error Handling: The provided error handling is basic. In a real application, ensure that errors
//    do not inadvertently leak sensitive information.
// 6. Environment: These functions are designed for Node.js. Running crypto operations in the browser
//    (renderer process) has different security considerations and limitations (e.g., `window.crypto.subtle`).
*/
