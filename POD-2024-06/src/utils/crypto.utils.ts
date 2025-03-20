import crypto from 'crypto';
import { SecurityConfig } from '../config/security.config';

export const cryptoUtils = {
  generateKey: (): Buffer => {
    return crypto.randomBytes(SecurityConfig.encryption.keyLength);
  },

  encrypt: (data: string, key: Buffer): { encrypted: string, iv: string, tag: string } => {
    const iv = crypto.randomBytes(SecurityConfig.encryption.ivLength);
    const cipher = crypto.createCipheriv(
      SecurityConfig.encryption.algorithm,
      key,
      iv
    ) as crypto.CipherGCM;

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag
    };
  },

  decrypt: (encrypted: string, key: Buffer, iv: string, tag: string): string => {
    const decipher = crypto.createDecipheriv(
      SecurityConfig.encryption.algorithm,
      key,
      Buffer.from(iv, 'hex')
    ) as crypto.DecipherGCM;

    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  },

  hash: (data: string): string => {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }
};
