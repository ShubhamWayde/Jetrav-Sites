CREATE TABLE quotations (
  "ID"          SERIAL      PRIMARY KEY,
  "customerID"  INTEGER     NOT NULL REFERENCES customers("ID") ON DELETE CASCADE,
  "type"        VARCHAR(30) NOT NULL,
  "assignTo"    VARCHAR(255),
  "remark"      TEXT,
  "details"     JSONB       NOT NULL DEFAULT '{}',
  "createdAt"   TIMESTAMP   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotations_customer ON quotations("customerID");
