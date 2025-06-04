import { StorageDriver, StorageOptions, StorageResult } from '../interfaces/storage.interfaces';
interface S3DriverConfig {
    bucket: string;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
    baseUrl?: string;
}
export declare class S3Driver implements StorageDriver {
    private config;
    private s3Client;
    configure(config: S3DriverConfig): void;
    put(filePath: string, content: Buffer, options?: StorageOptions): Promise<StorageResult>;
    get(filePath: string, options?: StorageOptions): Promise<Buffer>;
    delete(filePath: string, options?: StorageOptions): Promise<void>;
    exists(filePath: string, options?: StorageOptions): Promise<boolean>;
    url(filePath: string, options?: StorageOptions): Promise<string>;
    copy(from: string, to: string, options?: StorageOptions): Promise<void>;
    move(from: string, to: string, options?: StorageOptions): Promise<void>;
    size(filePath: string, options?: StorageOptions): Promise<number>;
    private generateUrl;
}
export {};
