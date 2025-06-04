import { PermissionsService } from './permissions.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    getAllRoles(): Promise<Role[]>;
    createRole(name: string, description?: string): Promise<Role>;
    updateRole(id: number, updates: Partial<Role>): Promise<Role>;
    deleteRole(id: number): Promise<{
        success: boolean;
    }>;
    getAllPermissions(): Promise<Permission[]>;
    createPermission(name: string, description?: string): Promise<Permission>;
    updatePermission(id: number, updates: Partial<Permission>): Promise<Permission>;
    deletePermission(id: number): Promise<{
        success: boolean;
    }>;
    assignPermissionToRole(roleId: number, permissionId: number): Promise<import(".").RolePermission>;
    revokePermissionFromRole(roleId: number, permissionId: number): Promise<{
        success: boolean;
    }>;
    getRolePermissions(roleId: number): Promise<Permission[]>;
    syncRolePermissions(roleId: number, permissionIds: number[]): Promise<import(".").RolePermission[]>;
    assignRoleToUser(userId: number, roleId: number): Promise<import(".").UserRole>;
    revokeRoleFromUser(userId: number, roleId: number): Promise<{
        success: boolean;
    }>;
    getUserRoles(userId: number): Promise<Role[]>;
    getUserPermissions(userId: number): Promise<string[]>;
    syncUserRoles(userId: number, roleIds: number[]): Promise<import(".").UserRole[]>;
    checkUserPermission(userId: number, permission: string): Promise<{
        hasPermission: boolean;
    }>;
}
