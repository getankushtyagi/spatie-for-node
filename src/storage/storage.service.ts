import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { LocalDriver } from './drivers/local.driver';
import { S3Driver } from './drivers/s3.driver';
import { StorageModuleOptions } from './storage.module';
import { StorageDriver, StorageOptions, StorageResult } from './interfaces/storage.interfaces';

@Injectable()
export class StorageService {
  private drivers: Map<string, StorageDriver> = new Map();

  constructor(
    @Inject('STORAGE_OPTIONS') private options: StorageModuleOptions,
    private localDriver: LocalDriver,
    private s3Driver: S3Driver,
  ) {
    this.initializeDrivers();
  }

  private initializeDrivers(): void {
    // Initialize local driver if configured
    if (this.options.local) {
      this.localDriver.configure(this.options.local);
      this.drivers.set('local', this.localDriver);
    }

    // Initialize S3 driver if configured
    if (this.options.s3) {
      this.s3Driver.configure(this.options.s3);
      this.drivers.set('s3', this.s3Driver);
    }
  }

  private getDriver(disk?: string): StorageDriver {
    const diskName = disk || this.options.default || 'local';
    const driver = this.drivers.get(diskName);
    
    if (!driver) {
      throw new BadRequestException(`Storage driver '${diskName}' not configured`);
    }
    
    return driver;
  }

  async put(path: string, content: Buffer, options: StorageOptions = {}): Promise<StorageResult> {
    const driver = this.getDriver(options.disk);
    return driver.put(path, content, options);
  }

  async get(path: string, options: StorageOptions = {}): Promise<Buffer> {
    const driver = this.getDriver(options.disk);
    return driver.get(path, options);
  }

  async delete(path: string, options: StorageOptions = {}): Promise<void> {
    const driver = this.getDriver(options.disk);
    return driver.delete(path, options);
  }

  async exists(path: string, options: StorageOptions = {}): Promise<boolean> {
    const driver = this.getDriver(options.disk);
    return driver.exists(path, options);
  }

  async url(path: string, options: StorageOptions = {}): Promise<string> {
    const driver = this.getDriver(options.disk);
    return driver.url(path, options);
  }

  async copy(from: string, to: string, options: StorageOptions = {}): Promise<void> {
    const driver = this.getDriver(options.disk);
    return driver.copy(from, to, options);
  }

  async move(from: string, to: string, options: StorageOptions = {}): Promise<void> {
    const driver = this.getDriver(options.disk);
    return driver.move(from, to, options);
  }

  async size(path: string, options: StorageOptions = {}): Promise<number> {
    const driver = this.getDriver(options.disk);
    return driver.size(path, options);
  }
}