export interface UserProfile {
  id:           number;
  firstName:    string;
  lastName:     string;
  email:        string;
  mobileNumber: string;
  isVerified:   boolean;
  hasPassword:  boolean;
  role:         string;
}
