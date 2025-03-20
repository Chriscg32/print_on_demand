export interface EncryptionResult {
        encrypted: string;
        iv: string;
        tag: string;
      }

      export interface SecurityHeaders {
        contentSecurityPolicy: {
          [key: string]: string[];
        };
        strictTransportSecurity: string;
        xFrameOptions: string;
        xContentTypeOptions: string;
        referrerPolicy: string;
      }

      export interface ValidationRules {
        inputMaxLength: number;
        allowedCharacters: RegExp;
        sanitizationLevel: string;
      }

      export interface MonitoringCheck {
        type: string;
        status: 'success' | 'failure';
        timestamp: Date;
        details?: any;
      }