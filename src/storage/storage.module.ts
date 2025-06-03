import { Module, DynamicModule } from '@nestjs/common';
import { StorageService } from './storage.service';
import { LocalDriver } from './drivers/local.driver';
import { S3Driver } from './drivers/s3.driver';

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

@Module({})
export class StorageModule {
  static register(options: StorageModuleOptions = {}): DynamicModule {
    const providers = [
      StorageService,
      LocalDriver,
      S3Driver,
      {
        provide: 'STORAGE_OPTIONS',
        useValue: options,
      },
    ];

    return {
      module: StorageModule,
      providers,
      exports: [StorageService],
    };
  }
}