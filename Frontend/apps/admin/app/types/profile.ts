// types for admin profile component
export interface AdminProfile {
  firstName:   string;
  lastName:    string;
  email:       string;
  mobileNumber: string;
  role:        string;
  hasPassword: boolean;
}

// response type for admin profile page API
export interface AdminProfile {
  id:           number;
  firstName:    string;
  lastName:     string;
  email:        string;
  mobileNumber: string;
  isVerified:   boolean;
  hasPassword:  boolean;
  role:         string;
}