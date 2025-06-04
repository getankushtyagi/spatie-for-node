import { RolePermission } from './role-permission.entity';
export declare class Permission {
    id: number;
    name: string;
    description: string;
    rolePermissions: RolePermission[];
    createdAt: Date;
    updatedAt: Date;
}
