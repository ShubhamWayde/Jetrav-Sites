CREATE TABLE leads (
  "ID"         SERIAL      PRIMARY KEY,
  "customerID" INTEGER     NOT NULL REFERENCES customers("ID") ON DELETE CASCADE,
  "type"       VARCHAR(30) NOT NULL,
  "status"     VARCHAR(30) NOT NULL DEFAULT 'quotation',
  "details"    JSONB       NOT NULL DEFAULT '{}',
  "assignTo"   VARCHAR(255),
  "remark"     TEXT,
  "createdBy"  INTEGER     NOT NULL REFERENCES users("ID"),
  "createdAt"  TIMESTAMP   NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_customer ON leads("customerID");
CREATE INDEX idx_leads_type     ON leads("type");
CREATE INDEX idx_leads_status   ON leads("status");
