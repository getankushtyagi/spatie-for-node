import { DynamicModule } from '@nestjs/common';
export interface PermissionsModuleOptions {
    controllers?: boolean;
    userEntity?: any;
}
export declare class PermissionsModule {
    static register(options?: PermissionsModuleOptions): DynamicModule;
}
