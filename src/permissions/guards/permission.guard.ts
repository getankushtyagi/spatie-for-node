import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions.service';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/requires-permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = user.id;

    // 🚨 SUPER ADMIN CHECK - Bypass all permission checks
    const isSuperAdmin = await this.permissionsService.hasRole(userId, 'super-admin');
    if (isSuperAdmin) {
      return true; // Super admin can access everything!
    }

    const requiredPermissions = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions or roles required, allow access
    if (!requiredPermissions && !requiredRoles) {
      return true;
    }


    // Check permissions
    if (requiredPermissions) {
      const hasPermission = await this.checkPermissions(userId, requiredPermissions);
      if (!hasPermission) {
        return false;
      }
    }

    // Check roles
    if (requiredRoles) {
      const hasRole = await this.checkRoles(userId, requiredRoles);
      if (!hasRole) {
        return false;
      }
    }

    return true;
  }

  private async checkPermissions(userId: number, requiredPermissions: any): Promise<boolean> {
    if (Array.isArray(requiredPermissions)) {
      // Default behavior: user needs ANY of the permissions
      return this.permissionsService.hasAnyPermission(userId, requiredPermissions);
    }

    if (typeof requiredPermissions === 'object') {
      const { permissions, logic } = requiredPermissions;

      if (logic === 'all') {
        return this.permissionsService.hasAllPermissions(userId, permissions);
      } else {
        return this.permissionsService.hasAnyPermission(userId, permissions);
      }
    }

    return false;
  }

  private async checkRoles(userId: number, requiredRoles: any): Promise<boolean> {
    if (Array.isArray(requiredRoles)) {
      // Default behavior: user needs ANY of the roles
      return this.permissionsService.hasAnyRole(userId, requiredRoles);
    }

    if (typeof requiredRoles === 'object') {
      const { roles, logic } = requiredRoles;

      if (logic === 'all') {
        return this.permissionsService.hasAllRoles(userId, roles);
      } else {
        return this.permissionsService.hasAnyRole(userId, roles);
      }
    }

    return false;
  }
}