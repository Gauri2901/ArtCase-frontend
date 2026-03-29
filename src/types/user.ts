export type UserAccount = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  token: string;
};

export type UserNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
};
