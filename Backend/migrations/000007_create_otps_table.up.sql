CREATE TABLE otps (
  "ID"           SERIAL PRIMARY KEY,
  "mobileNumber" VARCHAR NOT NULL,
  "otp"          VARCHAR(6) NOT NULL,
  "purpose"      VARCHAR DEFAULT 'signin',
  "isUsed"       BOOLEAN DEFAULT FALSE,
  "expiresAt"    TIMESTAMP NOT NULL,
  "createdAt"    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otps_mobile_purpose ON otps("mobileNumber", "purpose", "isUsed");
