import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
export declare class PermissionsService {
    private roleRepository;
    private permissionRepository;
    private rolePermissionRepository;
    private userRoleRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>, rolePermissionRepository: Repository<RolePermission>, userRoleRepository: Repository<UserRole>);
    createRole(name: string, description?: string): Promise<Role>;
    updateRole(id: number, updates: Partial<Role>): Promise<Role>;
    deleteRole(id: number): Promise<void>;
    getAllRoles(): Promise<Role[]>;
    getRoleByName(name: string): Promise<Role | null>;
    createPermission(name: string, description?: string): Promise<Permission>;
    updatePermission(id: number, updates: Partial<Permission>): Promise<Permission>;
    deletePermission(id: number): Promise<void>;
    getAllPermissions(): Promise<Permission[]>;
    getPermissionByName(name: string): Promise<Permission | null>;
    assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission>;
    assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<RolePermission[]>;
    revokePermissionFromRole(roleId: number, permissionId: number): Promise<void>;
    revokeAllPermissionsFromRole(roleId: number): Promise<void>;
    getRolePermissions(roleId: number): Promise<Permission[]>;
    assignRoleToUser(userId: number, roleId: number): Promise<UserRole>;
    assignRolesToUser(userId: number, roleIds: number[]): Promise<UserRole[]>;
    revokeRoleFromUser(userId: number, roleId: number): Promise<void>;
    revokeAllRolesFromUser(userId: number): Promise<void>;
    getUserRoles(userId: number): Promise<Role[]>;
    getUserPermissions(userId: number): Promise<string[]>;
    hasPermission(userId: number, permissionName: string): Promise<boolean>;
    hasAnyPermission(userId: number, permissionNames: string[]): Promise<boolean>;
    hasAllPermissions(userId: number, permissionNames: string[]): Promise<boolean>;
    hasRole(userId: number, roleName: string): Promise<boolean>;
    hasAnyRole(userId: number, roleNames: string[]): Promise<boolean>;
    hasAllRoles(userId: number, roleNames: string[]): Promise<boolean>;
    syncUserRoles(userId: number, roleIds: number[]): Promise<UserRole[]>;
    syncRolePermissions(roleId: number, permissionIds: number[]): Promise<RolePermission[]>;
}
