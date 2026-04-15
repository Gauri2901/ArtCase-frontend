 export interface UserAddress {
  _id: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
  addressType: 'Home' | 'Work' | 'Other';
}

export interface UserAccount {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  token: string;
  addresses?: UserAddress[];
}

export interface UserNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}
