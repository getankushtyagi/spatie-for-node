import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

export const RequiresPermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequiresRoles = (...roles: string[]) => 
  SetMetadata(ROLES_KEY, roles);

export const RequiresAnyPermission = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, { permissions, logic: 'any' });

export const RequiresAllPermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, { permissions, logic: 'all' });

export const RequiresAnyRole = (...roles: string[]) => 
  SetMetadata(ROLES_KEY, { roles, logic: 'any' });

export const RequiresAllRoles = (...roles: string[]) => 
  SetMetadata(ROLES_KEY, { roles, logic: 'all' });