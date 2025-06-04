import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';
export declare class Role {
    id: number;
    name: string;
    description: string;
    rolePermissions: RolePermission[];
    userRoles: UserRole[];
    createdAt: Date;
    updatedAt: Date;
}
