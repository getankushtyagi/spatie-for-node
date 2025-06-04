import { StorageDriver, StorageOptions, StorageResult } from '../interfaces/storage.interfaces';
interface LocalDriverConfig {
    rootPath: string;
    baseUrl?: string;
}
export declare class LocalDriver implements StorageDriver {
    private config;
    configure(config: LocalDriverConfig): void;
    put(filePath: string, content: Buffer, options?: StorageOptions): Promise<StorageResult>;
    get(filePath: string, options?: StorageOptions): Promise<Buffer>;
    delete(filePath: string, options?: StorageOptions): Promise<void>;
    exists(filePath: string, options?: StorageOptions): Promise<boolean>;
    url(filePath: string, options?: StorageOptions): Promise<string>;
    copy(from: string, to: string, options?: StorageOptions): Promise<void>;
    move(from: string, to: string, options?: StorageOptions): Promise<void>;
    size(filePath: string, options?: StorageOptions): Promise<number>;
    private ensureDirectoryExists;
    private generateUrl;
}
export {};
