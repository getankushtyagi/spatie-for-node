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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_service_1 = require("../permissions.service");
const requires_permissions_decorator_1 = require("../decorators/requires-permissions.decorator");
let PermissionGuard = class PermissionGuard {
    constructor(reflector, permissionsService) {
        this.reflector = reflector;
        this.permissionsService = permissionsService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        const userId = user.id;
        const isSuperAdmin = await this.permissionsService.hasRole(userId, 'super-admin');
        if (isSuperAdmin) {
            return true;
        }
        const requiredPermissions = this.reflector.getAllAndOverride(requires_permissions_decorator_1.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const requiredRoles = this.reflector.getAllAndOverride(requires_permissions_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions && !requiredRoles) {
            return true;
        }
        if (requiredPermissions) {
            const hasPermission = await this.checkPermissions(userId, requiredPermissions);
            if (!hasPermission) {
                return false;
            }
        }
        if (requiredRoles) {
            const hasRole = await this.checkRoles(userId, requiredRoles);
            if (!hasRole) {
                return false;
            }
        }
        return true;
    }
    async checkPermissions(userId, requiredPermissions) {
        if (Array.isArray(requiredPermissions)) {
            return this.permissionsService.hasAnyPermission(userId, requiredPermissions);
        }
        if (typeof requiredPermissions === 'object') {
            const { permissions, logic } = requiredPermissions;
            if (logic === 'all') {
                return this.permissionsService.hasAllPermissions(userId, permissions);
            }
            else {
                return this.permissionsService.hasAnyPermission(userId, permissions);
            }
        }
        return false;
    }
    async checkRoles(userId, requiredRoles) {
        if (Array.isArray(requiredRoles)) {
            return this.permissionsService.hasAnyRole(userId, requiredRoles);
        }
        if (typeof requiredRoles === 'object') {
            const { roles, logic } = requiredRoles;
            if (logic === 'all') {
                return this.permissionsService.hasAllRoles(userId, roles);
            }
            else {
                return this.permissionsService.hasAnyRole(userId, roles);
            }
        }
        return false;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        permissions_service_1.PermissionsService])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map