export declare const PERMISSIONS_KEY = "permissions";
export declare const ROLES_KEY = "roles";
export declare const RequiresPermissions: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequiresRoles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequiresAnyPermission: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequiresAllPermissions: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequiresAnyRole: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequiresAllRoles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
