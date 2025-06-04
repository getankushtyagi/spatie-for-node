import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions.service';
export declare class PermissionGuard implements CanActivate {
    private reflector;
    private permissionsService;
    constructor(reflector: Reflector, permissionsService: PermissionsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private checkPermissions;
    private checkRoles;
}
