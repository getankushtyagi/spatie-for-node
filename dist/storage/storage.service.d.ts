import { LocalDriver } from './drivers/local.driver';
import { S3Driver } from './drivers/s3.driver';
import { StorageModuleOptions } from './storage.module';
import { StorageOptions, StorageResult } from './interfaces/storage.interfaces';
export declare class StorageService {
    private options;
    private localDriver;
    private s3Driver;
    private drivers;
    constructor(options: StorageModuleOptions, localDriver: LocalDriver, s3Driver: S3Driver);
    private initializeDrivers;
    private getDriver;
    put(path: string, content: Buffer, options?: StorageOptions): Promise<StorageResult>;
    get(path: string, options?: StorageOptions): Promise<Buffer>;
    delete(path: string, options?: StorageOptions): Promise<void>;
    exists(path: string, options?: StorageOptions): Promise<boolean>;
    url(path: string, options?: StorageOptions): Promise<string>;
    copy(from: string, to: string, options?: StorageOptions): Promise<void>;
    move(from: string, to: string, options?: StorageOptions): Promise<void>;
    size(path: string, options?: StorageOptions): Promise<number>;
}
