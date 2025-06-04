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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const permissions_service_1 = require("./permissions.service");
const requires_permissions_decorator_1 = require("./decorators/requires-permissions.decorator");
const permission_guard_1 = require("./guards/permission.guard");
let PermissionsController = class PermissionsController {
    constructor(permissionsService) {
        this.permissionsService = permissionsService;
    }
    async getAllRoles() {
        return this.permissionsService.getAllRoles();
    }
    async createRole(name, description) {
        return this.permissionsService.createRole(name, description);
    }
    async updateRole(id, updates) {
        return this.permissionsService.updateRole(id, updates);
    }
    async deleteRole(id) {
        await this.permissionsService.deleteRole(id);
        return { success: true };
    }
    async getAllPermissions() {
        return this.permissionsService.getAllPermissions();
    }
    async createPermission(name, description) {
        return this.permissionsService.createPermission(name, description);
    }
    async updatePermission(id, updates) {
        return this.permissionsService.updatePermission(id, updates);
    }
    async deletePermission(id) {
        await this.permissionsService.deletePermission(id);
        return { success: true };
    }
    async assignPermissionToRole(roleId, permissionId) {
        return this.permissionsService.assignPermissionToRole(roleId, permissionId);
    }
    async revokePermissionFromRole(roleId, permissionId) {
        await this.permissionsService.revokePermissionFromRole(roleId, permissionId);
        return { success: true };
    }
    async getRolePermissions(roleId) {
        return this.permissionsService.getRolePermissions(roleId);
    }
    async syncRolePermissions(roleId, permissionIds) {
        return this.permissionsService.syncRolePermissions(roleId, permissionIds);
    }
    async assignRoleToUser(userId, roleId) {
        return this.permissionsService.assignRoleToUser(userId, roleId);
    }
    async revokeRoleFromUser(userId, roleId) {
        await this.permissionsService.revokeRoleFromUser(userId, roleId);
        return { success: true };
    }
    async getUserRoles(userId) {
        return this.permissionsService.getUserRoles(userId);
    }
    async getUserPermissions(userId) {
        return this.permissionsService.getUserPermissions(userId);
    }
    async syncUserRoles(userId, roleIds) {
        return this.permissionsService.syncUserRoles(userId, roleIds);
    }
    async checkUserPermission(userId, permission) {
        const hasPermission = await this.permissionsService.hasPermission(userId, permission);
        return { hasPermission };
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)('roles'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('view:roles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getAllRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('create:roles'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('update:roles'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('delete:roles'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('view:permissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getAllPermissions", null);
__decorate([
    (0, common_1.Post)('permissions'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('create:permissions'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "createPermission", null);
__decorate([
    (0, common_1.Put)('permissions/:id'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('update:permissions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "updatePermission", null);
__decorate([
    (0, common_1.Delete)('permissions/:id'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('delete:permissions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "deletePermission", null);
__decorate([
    (0, common_1.Post)('roles/:roleId/permissions/:permissionId'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('assign:permissions'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('permissionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "assignPermissionToRole", null);
__decorate([
    (0, common_1.Delete)('roles/:roleId/permissions/:permissionId'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('revoke:permissions'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('permissionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "revokePermissionFromRole", null);
__decorate([
    (0, common_1.Get)('roles/:roleId/permissions'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('view:permissions'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getRolePermissions", null);
__decorate([
    (0, common_1.Post)('roles/:roleId/permissions/sync'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('assign:permissions'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('permissionIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "syncRolePermissions", null);
__decorate([
    (0, common_1.Post)('users/:userId/roles/:roleId'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('assign:roles'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "assignRoleToUser", null);
__decorate([
    (0, common_1.Delete)('users/:userId/roles/:roleId'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('revoke:roles'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "revokeRoleFromUser", null);
__decorate([
    (0, common_1.Get)('users/:userId/roles'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('view:roles'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getUserRoles", null);
__decorate([
    (0, common_1.Get)('users/:userId/permissions'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('view:permissions'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Post)('users/:userId/roles/sync'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('assign:roles'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('roleIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "syncUserRoles", null);
__decorate([
    (0, common_1.Get)('users/:userId/can'),
    (0, requires_permissions_decorator_1.RequiresPermissions)('view:permissions'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "checkUserPermission", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, common_1.Controller)('permissions'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map