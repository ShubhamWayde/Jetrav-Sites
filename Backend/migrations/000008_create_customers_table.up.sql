CREATE TABLE customers (
  "ID"           SERIAL PRIMARY KEY,
  "firstName"    VARCHAR        NOT NULL,
  "lastName"     VARCHAR        NOT NULL,
  "planType"     VARCHAR        NOT NULL DEFAULT 'Silver',
  "jetcoins"     DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "totalTrips"   INTEGER        NOT NULL DEFAULT 0,
  "totalStays"   INTEGER        NOT NULL DEFAULT 0,
  "email"        VARCHAR,
  "mobileNumber" VARCHAR        NOT NULL,
  "reference"    VARCHAR,
  "addedBy"      INTEGER        NOT NULL REFERENCES users("ID") ON DELETE CASCADE,
  "createdAt"    TIMESTAMP      DEFAULT NOW(),
  "updatedAt"    TIMESTAMP      DEFAULT NOW()
);

CREATE INDEX idx_customers_added_by ON customers("addedBy");
CREATE INDEX idx_customers_mobile   ON customers("mobileNumber");
