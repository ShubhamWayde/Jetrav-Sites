// modal types for customer form
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
  addedBy:      number;
  addedByName:  string;
  addedOn:      string;
  updatedAt:    string;
}

// form values for customer form
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

// response type for customers list API
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
  addedBy:      number;
  addedByName:  string;
  addedOn:      string;
  updatedAt:    string;
}
