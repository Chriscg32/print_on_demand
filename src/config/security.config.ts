export const SecurityConfig = {
        encryption: {
          algorithm: 'aes-256-gcm',
          keyLength: 32,
          ivLength: 16,
          saltLength: 64
        },
        
        tls: {
          minVersion: 'TLSv1.3',
          cipherSuites: ['TLS_AES_256_GCM_SHA384']
        },
      
        headers: {
          contentSecurityPolicy: {
            defaultSrc: ["'none'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'none'"],
            frameSrc: ["'none'"]
          },
          strictTransportSecurity: 'max-age=31536000; includeSubDomains',
          xFrameOptions: 'DENY',
          xContentTypeOptions: 'nosniff',
          referrerPolicy: 'strict-origin-when-cross-origin'
        },
      
        validation: {
          inputMaxLength: 1000,
          allowedCharacters: /^[a-zA-Z0-9\s\-_.,!?@#$%^&*()]+$/,
          sanitizationLevel: 'high'
        }
      };