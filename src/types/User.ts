export type Role = 'customer' | 'agent' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}
