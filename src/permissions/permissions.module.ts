import { Module, DynamicModule } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';

export interface PermissionsModuleOptions {
  controllers?: boolean;
  userEntity?: any; // Allow custom user entity
}

@Module({})
export class PermissionsModule {
  static register(options: PermissionsModuleOptions = {}): DynamicModule {
    return {
      module: PermissionsModule,
      imports: [
        TypeOrmModule.forFeature([Role, Permission, RolePermission, UserRole]),
      ],
      providers: [PermissionsService],
      controllers: options.controllers ? [PermissionsController] : [],
      exports: [PermissionsService],
    };
  }
}
