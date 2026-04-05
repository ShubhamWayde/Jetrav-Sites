-- ─── Step 1: Drop the new FK constraints ─────────────────────────────────────
ALTER TABLE leads      DROP CONSTRAINT IF EXISTS "leads_customerID_fkey";
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS "quotations_customerID_fkey";

-- ─── Step 2: Recreate the customers table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  "ID"           SERIAL        PRIMARY KEY,
  "firstName"    VARCHAR       NOT NULL,
  "lastName"     VARCHAR       NOT NULL,
  "planType"     VARCHAR       NOT NULL DEFAULT 'Silver',
  "jetcoins"     DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalTrips"   INTEGER       NOT NULL DEFAULT 0,
  "totalStays"   INTEGER       NOT NULL DEFAULT 0,
  "email"        VARCHAR,
  "mobileNumber" VARCHAR       NOT NULL,
  "reference"    VARCHAR,
  "addedBy"      INTEGER       REFERENCES users("ID"),
  "createdAt"    TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── Step 3: Remove customer-specific columns from users ─────────────────────
ALTER TABLE users
  DROP COLUMN IF EXISTS "totalTrips",
  DROP COLUMN IF EXISTS "totalStays",
  DROP COLUMN IF EXISTS "reference",
  DROP COLUMN IF EXISTS "addedBy";

-- Note: leads/quotations customerID values now point to users.ID.
-- Data re-mapping back to customers.ID is not included in this rollback.
-- Re-add FK from leads/quotations to customers if needed manually.
