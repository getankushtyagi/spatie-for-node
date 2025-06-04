import { DynamicModule } from '@nestjs/common';
export interface MediaModuleOptions {
    controllers?: boolean;
    storage?: {
        default: 'local' | 's3';
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
    };
}
export declare class MediaModule {
    static register(options?: MediaModuleOptions): DynamicModule;
}
