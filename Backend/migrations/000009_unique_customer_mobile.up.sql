-- Step 1: Remove duplicate mobile numbers, keeping only the earliest record
-- (lowest "ID") for each mobile number so we lose the least data possible.
DELETE FROM customers
WHERE "ID" NOT IN (
  SELECT MIN("ID")
  FROM customers
  GROUP BY "mobileNumber"
);

-- Step 2: Now it is safe to add the unique constraint.
ALTER TABLE customers
  ADD CONSTRAINT customers_mobileNumber_unique UNIQUE ("mobileNumber");
