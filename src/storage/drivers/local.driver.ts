import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageDriver, StorageOptions, StorageResult } from '../interfaces/storage.interfaces';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

interface LocalDriverConfig {
  rootPath: string;
  baseUrl?: string;
}

@Injectable()
export class LocalDriver implements StorageDriver {
  private config!: LocalDriverConfig;

  configure(config: LocalDriverConfig): void {
    this.config = config;
    this.ensureDirectoryExists(this.config.rootPath);
  }

  async put(filePath: string, content: Buffer, options: StorageOptions = {}): Promise<StorageResult> {
    const fullPath = path.join(this.config.rootPath, filePath);
    const directory = path.dirname(fullPath);
    
    await this.ensureDirectoryExists(directory);
    await fs.writeFile(fullPath, content);
    
    const stats = await fs.stat(fullPath);
    const url = this.generateUrl(filePath);
    
    return {
      path: filePath,
      url,
      size: stats.size,
    };
  }

  async get(filePath: string, options: StorageOptions = {}): Promise<Buffer> {
    const fullPath = path.join(this.config.rootPath, filePath);
    
    if (!existsSync(fullPath)) {
      throw new NotFoundException(`File not found: ${filePath}`);
    }
    
    return fs.readFile(fullPath);
  }

  async delete(filePath: string, options: StorageOptions = {}): Promise<void> {
    const fullPath = path.join(this.config.rootPath, filePath);
    
    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }
  }

  async exists(filePath: string, options: StorageOptions = {}): Promise<boolean> {
    const fullPath = path.join(this.config.rootPath, filePath);
    return existsSync(fullPath);
  }

  async url(filePath: string, options: StorageOptions = {}): Promise<string> {
    return this.generateUrl(filePath);
  }

  async copy(from: string, to: string, options: StorageOptions = {}): Promise<void> {
    const fromPath = path.join(this.config.rootPath, from);
    const toPath = path.join(this.config.rootPath, to);
    
    if (!existsSync(fromPath)) {
      throw new NotFoundException(`Source file not found: ${from}`);
    }
    
    const directory = path.dirname(toPath);
    await this.ensureDirectoryExists(directory);
    
    await fs.copyFile(fromPath, toPath);
  }

  async move(from: string, to: string, options: StorageOptions = {}): Promise<void> {
    await this.copy(from, to, options);
    await this.delete(from, options);
  }

  async size(filePath: string, options: StorageOptions = {}): Promise<number> {
    const fullPath = path.join(this.config.rootPath, filePath);
    
    if (!existsSync(fullPath)) {
      throw new NotFoundException(`File not found: ${filePath}`);
    }
    
    const stats = await fs.stat(fullPath);
    return stats.size;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private generateUrl(filePath: string): string {
    if (this.config.baseUrl) {
      return `${this.config.baseUrl}/${filePath}`.replace(/\/+/g, '/');
    }
    return `/storage/${filePath}`;
  }
}