import { Permissions } from './permissions.interface';
export interface Roles {
    description: string;
    name: string;
    permissions: Permissions;
}