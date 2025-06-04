import { DynamicModule } from '@nestjs/common';
export interface StorageModuleOptions {
    default?: 'local' | 's3';
    local?: {
        rootPath: string;
        baseUrl?: string;
    };
    s3?: {
        bucket: string;
        region: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        baseUrl?: string;
    };
}
export declare class StorageModule {
    static register(options?: StorageModuleOptions): DynamicModule;
}
