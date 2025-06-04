"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const role_permission_entity_1 = require("./entities/role-permission.entity");
const user_role_entity_1 = require("./entities/user-role.entity");
let PermissionsService = class PermissionsService {
    constructor(roleRepository, permissionRepository, rolePermissionRepository, userRoleRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userRoleRepository = userRoleRepository;
    }
    async createRole(name, description) {
        const existingRole = await this.roleRepository.findOne({ where: { name } });
        if (existingRole) {
            throw new Error(`Role '${name}' already exists`);
        }
        const role = this.roleRepository.create({ name, description });
        return this.roleRepository.save(role);
    }
    async updateRole(id, updates) {
        await this.roleRepository.update(id, updates);
        const updatedRole = await this.roleRepository.findOne({ where: { id } });
        if (!updatedRole) {
            throw new Error(`Role with id '${id}' not found`);
        }
        return updatedRole;
    }
    async deleteRole(id) {
        await this.rolePermissionRepository.delete({ roleId: id });
        await this.userRoleRepository.delete({ roleId: id });
        await this.roleRepository.delete(id);
    }
    async getAllRoles() {
        return this.roleRepository.find();
    }
    async getRoleByName(name) {
        return this.roleRepository.findOne({ where: { name } });
    }
    async createPermission(name, description) {
        const existingPermission = await this.permissionRepository.findOne({ where: { name } });
        if (existingPermission) {
            throw new Error(`Permission '${name}' already exists`);
        }
        const permission = this.permissionRepository.create({ name, description });
        return this.permissionRepository.save(permission);
    }
    async updatePermission(id, updates) {
        await this.permissionRepository.update(id, updates);
        const updatedPermission = await this.permissionRepository.findOne({ where: { id } });
        if (!updatedPermission) {
            throw new Error(`Permission with id '${id}' not found`);
        }
        return updatedPermission;
    }
    async deletePermission(id) {
        await this.rolePermissionRepository.delete({ permissionId: id });
        await this.permissionRepository.delete(id);
    }
    async getAllPermissions() {
        return this.permissionRepository.find();
    }
    async getPermissionByName(name) {
        return this.permissionRepository.findOne({ where: { name } });
    }
    async assignPermissionToRole(roleId, permissionId) {
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
    async assignPermissionsToRole(roleId, permissionIds) {
        const results = [];
        for (const permissionId of permissionIds) {
            const result = await this.assignPermissionToRole(roleId, permissionId);
            results.push(result);
        }
        return results;
    }
    async revokePermissionFromRole(roleId, permissionId) {
        await this.rolePermissionRepository.delete({ roleId, permissionId });
    }
    async revokeAllPermissionsFromRole(roleId) {
        await this.rolePermissionRepository.delete({ roleId });
    }
    async getRolePermissions(roleId) {
        const rolePermissions = await this.rolePermissionRepository.find({
            where: { roleId },
            relations: ['permission'],
        });
        return rolePermissions.map(rp => rp.permission);
    }
    async assignRoleToUser(userId, roleId) {
        const existing = await this.userRoleRepository.findOne({
            where: { userId, roleId },
        });
        if (existing) {
            return existing;
        }
        const userRole = this.userRoleRepository.create({ userId, roleId });
        return this.userRoleRepository.save(userRole);
    }
    async assignRolesToUser(userId, roleIds) {
        const results = [];
        for (const roleId of roleIds) {
            const result = await this.assignRoleToUser(userId, roleId);
            results.push(result);
        }
        return results;
    }
    async revokeRoleFromUser(userId, roleId) {
        await this.userRoleRepository.delete({ userId, roleId });
    }
    async revokeAllRolesFromUser(userId) {
        await this.userRoleRepository.delete({ userId });
    }
    async getUserRoles(userId) {
        const userRoles = await this.userRoleRepository.find({
            where: { userId },
            relations: ['role'],
        });
        return userRoles.map(ur => ur.role);
    }
    async getUserPermissions(userId) {
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
    async hasPermission(userId, permissionName) {
        const userPermissions = await this.getUserPermissions(userId);
        return userPermissions.includes(permissionName);
    }
    async hasAnyPermission(userId, permissionNames) {
        const userPermissions = await this.getUserPermissions(userId);
        return permissionNames.some(permission => userPermissions.includes(permission));
    }
    async hasAllPermissions(userId, permissionNames) {
        const userPermissions = await this.getUserPermissions(userId);
        return permissionNames.every(permission => userPermissions.includes(permission));
    }
    async hasRole(userId, roleName) {
        const userRoles = await this.getUserRoles(userId);
        return userRoles.some(role => role.name === roleName);
    }
    async hasAnyRole(userId, roleNames) {
        const userRoles = await this.getUserRoles(userId);
        const userRoleNames = userRoles.map(role => role.name);
        return roleNames.some(roleName => userRoleNames.includes(roleName));
    }
    async hasAllRoles(userId, roleNames) {
        const userRoles = await this.getUserRoles(userId);
        const userRoleNames = userRoles.map(role => role.name);
        return roleNames.every(roleName => userRoleNames.includes(roleName));
    }
    async syncUserRoles(userId, roleIds) {
        await this.revokeAllRolesFromUser(userId);
        return this.assignRolesToUser(userId, roleIds);
    }
    async syncRolePermissions(roleId, permissionIds) {
        await this.revokeAllPermissionsFromRole(roleId);
        return this.assignPermissionsToRole(roleId, permissionIds);
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(2, (0, typeorm_1.InjectRepository)(role_permission_entity_1.RolePermission)),
    __param(3, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map