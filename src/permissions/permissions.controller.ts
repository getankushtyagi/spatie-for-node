import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RequiresPermissions } from './decorators/requires-permissions.decorator';
import { PermissionGuard } from './guards/permission.guard';

@Controller('permissions')
@UseGuards(PermissionGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Role endpoints
  @Get('roles')
  @RequiresPermissions('view:roles')
  async getAllRoles(): Promise<Role[]> {
    return this.permissionsService.getAllRoles();
  }

  @Post('roles')
  @RequiresPermissions('create:roles')
  async createRole(
    @Body('name') name: string,
    @Body('description') description?: string,
  ): Promise<Role> {
    return this.permissionsService.createRole(name, description);
  }

  @Put('roles/:id')
  @RequiresPermissions('update:roles')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updates: Partial<Role>,
  ): Promise<Role> {
    return this.permissionsService.updateRole(id, updates);
  }

  @Delete('roles/:id')
  @RequiresPermissions('delete:roles')
  async deleteRole(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.permissionsService.deleteRole(id);
    return { success: true };
  }

  // Permission endpoints
  @Get('permissions')
  @RequiresPermissions('view:permissions')
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionsService.getAllPermissions();
  }

  @Post('permissions')
  @RequiresPermissions('create:permissions')
  async createPermission(
    @Body('name') name: string,
    @Body('description') description?: string,
  ): Promise<Permission> {
    return this.permissionsService.createPermission(name, description);
  }

  @Put('permissions/:id')
  @RequiresPermissions('update:permissions')
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updates: Partial<Permission>,
  ): Promise<Permission> {
    return this.permissionsService.updatePermission(id, updates);
  }

  @Delete('permissions/:id')
  @RequiresPermissions('delete:permissions')
  async deletePermission(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.permissionsService.deletePermission(id);
    return { success: true };
  }

  // Role-Permission management
  @Post('roles/:roleId/permissions/:permissionId')
  @RequiresPermissions('assign:permissions')
  async assignPermissionToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.permissionsService.assignPermissionToRole(roleId, permissionId);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @RequiresPermissions('revoke:permissions')
  async revokePermissionFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ): Promise<{ success: boolean }> {
    await this.permissionsService.revokePermissionFromRole(roleId, permissionId);
    return { success: true };
  }

  @Get('roles/:roleId/permissions')
  @RequiresPermissions('view:permissions')
  async getRolePermissions(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.permissionsService.getRolePermissions(roleId);
  }

  @Post('roles/:roleId/permissions/sync')
  @RequiresPermissions('assign:permissions')
  async syncRolePermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body('permissionIds') permissionIds: number[],
  ) {
    return this.permissionsService.syncRolePermissions(roleId, permissionIds);
  }

  // User-Role management
  @Post('users/:userId/roles/:roleId')
  @RequiresPermissions('assign:roles')
  async assignRoleToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.permissionsService.assignRoleToUser(userId, roleId);
  }

  @Delete('users/:userId/roles/:roleId')
  @RequiresPermissions('revoke:roles')
  async revokeRoleFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<{ success: boolean }> {
    await this.permissionsService.revokeRoleFromUser(userId, roleId);
    return { success: true };
  }

  @Get('users/:userId/roles')
  @RequiresPermissions('view:roles')
  async getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.permissionsService.getUserRoles(userId);
  }

  @Get('users/:userId/permissions')
  @RequiresPermissions('view:permissions')
  async getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.permissionsService.getUserPermissions(userId);
  }

  @Post('users/:userId/roles/sync')
  @RequiresPermissions('assign:roles')
  async syncUserRoles(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('roleIds') roleIds: number[],
  ) {
    return this.permissionsService.syncUserRoles(userId, roleIds);
  }

  // Permission checking endpoints
  @Get('users/:userId/can')
  @RequiresPermissions('view:permissions')
  async checkUserPermission(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('permission') permission: string,
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.permissionsService.hasPermission(userId, permission);
    return { hasPermission };
  }
}