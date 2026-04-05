export interface CustomerResponse {
  id:           number;
  firstName:    string;
  lastName:     string;
  fullName:     string;
  planType:     string;
  jetcoins:     number;
  totalTrips:   number;
  totalStays:   number;
  email:        string;
  mobileNumber: string;
  reference:    string;
  addedBy:      number | null;
  addedByName:  string;
  addedOn:      string;
  updatedAt:    string;
}

export interface CustomerFormValues {
  firstName:    string;
  lastName:     string;
  email:        string;
  mobileNumber: string;
  planType:     string;
  jetcoins:     string;
  totalTrips:   string;
  totalStays:   string;
  reference:    string;
}
