export interface UserProfile {
  id:           number;
  firstName:    string;
  lastName:     string;
  email:        string;
  mobileNumber: string;
  isVerified:   boolean;
  hasPassword:  boolean;
  role:         string;
  totalTrips:   number;
  totalStays:   number;
}

export interface LeadResponse {
  id:            number;
  customerId:    number;
  customerName:  string;
  mobileNumber:  string;
  type:          string;
  status:        string;
  details:       Record<string, unknown>;
  assignTo:      string;
  remark:        string;
  createdBy:     number;
  createdByName: string;
  createdAt:     string;
  updatedAt:     string;
}

export interface QuotationResponse {
  id:         number;
  customerId: number;
  type:       string;
  assignTo:   string;
  remark:     string;
  details:    Record<string, unknown>;
  createdAt:  string;
  updatedAt:  string;
}

export interface UserDashboard {
  leads:      LeadResponse[];
  quotations: QuotationResponse[];
}
