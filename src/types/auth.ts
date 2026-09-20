
export type UserRole = 'INSPECTOR' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  factoryId: string;
}
