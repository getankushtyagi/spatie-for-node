export interface StorageDriver {
  put(path: string, content: Buffer, options?: StorageOptions): Promise<StorageResult>;
  get(path: string, options?: StorageOptions): Promise<Buffer>;
  delete(path: string, options?: StorageOptions): Promise<void>;
  exists(path: string, options?: StorageOptions): Promise<boolean>;
  url(path: string, options?: StorageOptions): Promise<string>;
  copy(from: string, to: string, options?: StorageOptions): Promise<void>;
  move(from: string, to: string, options?: StorageOptions): Promise<void>;
  size(path: string, options?: StorageOptions): Promise<number>;
}

export interface StorageOptions {
  disk?: string;
  contentType?: string;
  visibility?: 'public' | 'private';
  metadata?: Record<string, string>;
}

export interface StorageResult {
  path: string;
  url: string;
  size: number;
}

export interface StorageConfig {
  default: string;
  disks: Record<string, DiskConfig>;
}

export interface DiskConfig {
  driver: 'local' | 's3';
  config: LocalConfig | S3Config;
}

export interface LocalConfig {
  rootPath: string;
  baseUrl?: string;
  visibility?: 'public' | 'private';
}

export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  baseUrl?: string;
  visibility?: 'public' | 'private';
}