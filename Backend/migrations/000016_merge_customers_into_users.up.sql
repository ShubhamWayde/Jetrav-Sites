-- ─── Step 1: Add customer-specific columns to users ──────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "totalTrips" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalStays" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "reference"  VARCHAR,
  ADD COLUMN IF NOT EXISTS "addedBy"    INTEGER REFERENCES users("ID") ON DELETE SET NULL;

-- ─── Step 2: Temp column to record which customers.ID each user row came from ─
-- This lets Steps 4-5 remap by ID (reliable) instead of by phone (fragile).
ALTER TABLE users ADD COLUMN IF NOT EXISTS "_old_customer_id" INTEGER;

-- ─── Step 3a: For customers whose phone already exists in users — update & tag ─
UPDATE users u
SET
  "totalTrips"       = c."totalTrips",
  "totalStays"       = c."totalStays",
  "reference"        = c."reference",
  "addedBy"          = c."addedBy",
  "_old_customer_id" = c."ID"
FROM customers c
WHERE c."mobileNumber" != ''
  AND c."mobileNumber" IS NOT NULL
  AND u."phoneNumber"  = c."mobileNumber";

-- ─── Step 3b: Create user rows for customers that have no matching user yet ───
INSERT INTO users (
  "firstName", "lastName", "email", "phoneNumber",
  "password", "isVerified", "role",
  "totalTrips", "totalStays", "reference", "addedBy",
  "_old_customer_id"
)
SELECT
  c."firstName",
  c."lastName",
  COALESCE(NULLIF(c."email", ''), ''),
  -- Use a stable placeholder if mobileNumber is blank so the row is unique
  CASE
    WHEN c."mobileNumber" IS NULL OR c."mobileNumber" = ''
      THEN 'cust_' || c."ID"
    ELSE c."mobileNumber"
  END,
  '',
  false,
  'user',
  c."totalTrips",
  c."totalStays",
  c."reference",
  c."addedBy",
  c."ID"
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u."_old_customer_id" = c."ID"
);

-- ─── Step 4: Drop the old FK constraints (use auto-generated names with capital ID) ─
ALTER TABLE leads      DROP CONSTRAINT IF EXISTS "leads_customerID_fkey";
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS "quotations_customerID_fkey";

-- ─── Step 5: Re-point leads.customerID → users.ID via the mapping column ──────
UPDATE leads l
SET "customerID" = u."ID"
FROM users u
WHERE u."_old_customer_id" = l."customerID";

-- ─── Step 6: Re-point quotations.customerID → users.ID via the mapping column ─
UPDATE quotations q
SET "customerID" = u."ID"
FROM users u
WHERE u."_old_customer_id" = q."customerID";

-- ─── Step 7: Delete any leads / quotations that still couldn't be remapped ────
-- (safety net: prevents FK violation when adding the new constraint)
DELETE FROM quotations WHERE "customerID" NOT IN (SELECT "ID" FROM users);
DELETE FROM leads      WHERE "customerID" NOT IN (SELECT "ID" FROM users);

-- ─── Step 8: Add new FK constraints pointing at users ────────────────────────
ALTER TABLE leads
  ADD CONSTRAINT "leads_customerID_fkey"
  FOREIGN KEY ("customerID") REFERENCES users("ID") ON DELETE CASCADE;

ALTER TABLE quotations
  ADD CONSTRAINT "quotations_customerID_fkey"
  FOREIGN KEY ("customerID") REFERENCES users("ID") ON DELETE CASCADE;

-- ─── Step 9: Clean up and drop customers ──────────────────────────────────────
ALTER TABLE users DROP COLUMN IF EXISTS "_old_customer_id";
DROP TABLE IF EXISTS customers;
