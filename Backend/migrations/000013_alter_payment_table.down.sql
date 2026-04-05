ALTER TABLE payment
  DROP COLUMN IF EXISTS "razorpayOrderID",
  DROP COLUMN IF EXISTS "razorpayPaymentID",
  DROP COLUMN IF EXISTS "razorpaySignature";
