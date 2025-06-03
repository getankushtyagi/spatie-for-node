import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageDriver, StorageOptions, StorageResult } from '../interfaces/storage.interfaces';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface S3DriverConfig {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  baseUrl?: string;
}

@Injectable()
export class S3Driver implements StorageDriver {
  private config!: S3DriverConfig;
  private s3Client!: S3Client;

  configure(config: S3DriverConfig): void {
    this.config = config;
    this.s3Client = new S3Client({
      region: config.region,
      credentials: config.accessKeyId && config.secretAccessKey ? {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      } : undefined,
      endpoint: config.endpoint,
    });
  }

  async put(filePath: string, content: Buffer, options: StorageOptions = {}): Promise<StorageResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: filePath,
        Body: content,
        ContentType: options.contentType,
        Metadata: options.metadata,
        ACL: options.visibility === 'public' ? 'public-read' : 'private',
      });

      await this.s3Client.send(command);
      
      const url = await this.generateUrl(filePath, options);
      
      return {
        path: filePath,
        url,
        size: content.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to upload file: ${errorMessage}`);
    }
  }

  async get(filePath: string, options: StorageOptions = {}): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: filePath,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new NotFoundException(`File not found: ${filePath}`);
      }

      const chunks: Buffer[] = [];
      for await (const chunk of response.Body as NodeJS.ReadableStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'NoSuchKey') {
        throw new NotFoundException(`File not found: ${filePath}`);
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to get file: ${errorMessage}`);
    }
  }

  async delete(filePath: string, options: StorageOptions = {}): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: filePath,
      });

      await this.s3Client.send(command);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to delete file: ${errorMessage}`);
    }
  }

  async exists(filePath: string, options: StorageOptions = {}): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: filePath,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'NotFound') {
        return false;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to check file existence: ${errorMessage}`);
    }
  }

  async url(filePath: string, options: StorageOptions = {}): Promise<string> {
    return this.generateUrl(filePath, options);
  }

  async copy(from: string, to: string, options: StorageOptions = {}): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.config.bucket,
        CopySource: `${this.config.bucket}/${from}`,
        Key: to,
        ACL: options.visibility === 'public' ? 'public-read' : 'private',
      });

      await this.s3Client.send(command);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to copy file: ${errorMessage}`);
    }
  }

  async move(from: string, to: string, options: StorageOptions = {}): Promise<void> {
    await this.copy(from, to, options);
    await this.delete(from, options);
  }

  async size(filePath: string, options: StorageOptions = {}): Promise<number> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: filePath,
      });

      const response = await this.s3Client.send(command);
      return response.ContentLength || 0;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'NotFound') {
        throw new NotFoundException(`File not found: ${filePath}`);
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to get file size: ${errorMessage}`);
    }
  }

  private async generateUrl(filePath: string, options: StorageOptions = {}): Promise<string> {
    if (this.config.baseUrl) {
      return `${this.config.baseUrl}/${filePath}`;
    }

    if (options.visibility === 'public') {
      return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${filePath}`;
    }

    // Generate signed URL for private files
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: filePath,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}