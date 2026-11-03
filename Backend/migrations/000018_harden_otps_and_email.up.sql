-- ─── OTPs: store a SHA-256 hash instead of the code, and count failed guesses ──
-- Existing rows hold plain-text codes that the new verifier can't match: expire them.
UPDATE otps SET "isUsed" = TRUE WHERE "isUsed" = FALSE;

ALTER TABLE otps
  ALTER COLUMN "otp" TYPE VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_otps_mobile_created ON otps ("mobileNumber", "createdAt" DESC);

-- ─── Users: email is optional, so only non-empty emails must be unique ─────────
-- (the column-level UNIQUE rejected the second user signing up without an email)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_non_empty
  ON users ("email") WHERE "email" IS NOT NULL AND "email" <> '';
