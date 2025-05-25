import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  // Role Management
  async createRole(name: string, description?: string): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new Error(`Role '${name}' already exists`);
    }

    const role = this.roleRepository.create({ name, description });
    return this.roleRepository.save(role);
  }

  async updateRole(id: number, updates: Partial<Role>): Promise<Role> {
    await this.roleRepository.update(id, updates);
    const updatedRole = await this.roleRepository.findOne({ where: { id } });
    if (!updatedRole) {
      throw new Error(`Role with id '${id}' not found`);
    }
    return updatedRole;
  }

  async deleteRole(id: number): Promise<void> {
    // Remove all role permissions first
    await this.rolePermissionRepository.delete({ roleId: id });
    // Remove all user roles
    await this.userRoleRepository.delete({ roleId: id });
    // Delete the role
    await this.roleRepository.delete(id);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { name } });
  }

  // Permission Management
  async createPermission(name: string, description?: string): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({ where: { name } });
    if (existingPermission) {
      throw new Error(`Permission '${name}' already exists`);
    }

    const permission = this.permissionRepository.create({ name, description });
    return this.permissionRepository.save(permission);
  }

  async updatePermission(id: number, updates: Partial<Permission>): Promise<Permission> {
    await this.permissionRepository.update(id, updates);
    const updatedPermission = await this.permissionRepository.findOne({ where: { id } });
    if (!updatedPermission) {
      throw new Error(`Permission with id '${id}' not found`);
    }
    return updatedPermission;
  }

  async deletePermission(id: number): Promise<void> {
    // Remove all role permissions first
    await this.rolePermissionRepository.delete({ permissionId: id });
    // Delete the permission
    await this.permissionRepository.delete(id);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async getPermissionByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { name } });
  }

  // Role-Permission Management
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission> {
    const existing = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });

    if (existing) {
      return existing;
    }

    const rolePermission = this.rolePermissionRepository.create({
      roleId,
      permissionId,
    });
    return this.rolePermissionRepository.save(rolePermission);
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<RolePermission[]> {
    const results = [];
    for (const permissionId of permissionIds) {
      const result = await this.assignPermissionToRole(roleId, permissionId);
      results.push(result);
    }
    return results;
  }

  async revokePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId, permissionId });
  }

  async revokeAllPermissionsFromRole(roleId: number): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId });
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });
    return rolePermissions.map(rp => rp.permission);
  }

  // User-Role Management
  async assignRoleToUser(userId: number, roleId: number): Promise<UserRole> {
    const existing = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (existing) {
      return existing;
    }

    const userRole = this.userRoleRepository.create({ userId, roleId });
    return this.userRoleRepository.save(userRole);
  }

  async assignRolesToUser(userId: number, roleIds: number[]): Promise<UserRole[]> {
    const results = [];
    for (const roleId of roleIds) {
      const result = await this.assignRoleToUser(userId, roleId);
      results.push(result);
    }
    return results;
  }

  async revokeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await this.userRoleRepository.delete({ userId, roleId });
  }

  async revokeAllRolesFromUser(userId: number): Promise<void> {
    await this.userRoleRepository.delete({ userId });
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });
    return userRoles.map(ur => ur.role);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const roles = await this.getUserRoles(userId);
    const roleIds = roles.map(role => role.id);

    if (roleIds.length === 0) {
      return [];
    }

    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('role_permissions', 'rp', 'rp.permissionId = permission.id')
      .where('rp.roleId IN (:...roleIds)', { roleIds })
      .getMany();

    return permissions.map(permission => permission.name);
  }

  async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(permissionName);
  }

  async hasAnyPermission(userId: number, permissionNames: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissionNames.some(permission => userPermissions.includes(permission));
  }

  async hasAllPermissions(userId: number, permissionNames: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissionNames.every(permission => userPermissions.includes(permission));
  }

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(role => role.name === roleName);
  }

  async hasAnyRole(userId: number, roleNames: string[]): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    const userRoleNames = userRoles.map(role => role.name);
    return roleNames.some(roleName => userRoleNames.includes(roleName));
  }

  async hasAllRoles(userId: number, roleNames: string[]): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    const userRoleNames = userRoles.map(role => role.name);
    return roleNames.every(roleName => userRoleNames.includes(roleName));
  }

  // Bulk operations
  async syncUserRoles(userId: number, roleIds: number[]): Promise<UserRole[]> {
    await this.revokeAllRolesFromUser(userId);
    return this.assignRolesToUser(userId, roleIds);
  }

  async syncRolePermissions(roleId: number, permissionIds: number[]): Promise<RolePermission[]> {
    await this.revokeAllPermissionsFromRole(roleId);
    return this.assignPermissionsToRole(roleId, permissionIds);
  }
}