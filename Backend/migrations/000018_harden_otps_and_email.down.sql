DROP INDEX IF EXISTS users_email_unique_non_empty;
-- Note: re-adding users_email_key fails if several users have an empty email.
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE ("email");

DROP INDEX IF EXISTS idx_otps_mobile_created;
UPDATE otps SET "isUsed" = TRUE WHERE "isUsed" = FALSE;
ALTER TABLE otps DROP COLUMN IF EXISTS "attempts";
ALTER TABLE otps ALTER COLUMN "otp" TYPE VARCHAR(64);
