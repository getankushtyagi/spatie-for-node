"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Driver = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3Driver = class S3Driver {
    configure(config) {
        this.config = config;
        this.s3Client = new client_s3_1.S3Client({
            region: config.region,
            credentials: config.accessKeyId && config.secretAccessKey ? {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            } : undefined,
            endpoint: config.endpoint,
        });
    }
    async put(filePath, content, options = {}) {
        try {
            const command = new client_s3_1.PutObjectCommand({
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new common_1.InternalServerErrorException(`Failed to upload file: ${errorMessage}`);
        }
    }
    async get(filePath, options = {}) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.config.bucket,
                Key: filePath,
            });
            const response = await this.s3Client.send(command);
            if (!response.Body) {
                throw new common_1.NotFoundException(`File not found: ${filePath}`);
            }
            const chunks = [];
            for await (const chunk of response.Body) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            return Buffer.concat(chunks);
        }
        catch (error) {
            if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'NoSuchKey') {
                throw new common_1.NotFoundException(`File not found: ${filePath}`);
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new common_1.InternalServerErrorException(`Failed to get file: ${errorMessage}`);
        }
    }
    async delete(filePath, options = {}) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.config.bucket,
                Key: filePath,
            });
            await this.s3Client.send(command);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new common_1.InternalServerErrorException(`Failed to delete file: ${errorMessage}`);
        }
    }
    async exists(filePath, options = {}) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.config.bucket,
                Key: filePath,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'NotFound') {
                return false;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new common_1.InternalServerErrorException(`Failed to check file existence: ${errorMessage}`);
        }
    }
    async url(filePath, options = {}) {
        return this.generateUrl(filePath, options);
    }
    async copy(from, to, options = {}) {
        try {
            const command = new client_s3_1.CopyObjectCommand({
                Bucket: this.config.bucket,
                CopySource: `${this.config.bucket}/${from}`,
                Key: to,
                ACL: options.visibility === 'public' ? 'public-read' : 'private',
            });
            await this.s3Client.send(command);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new common_1.InternalServerErrorException(`Failed to copy file: ${errorMessage}`);
        }
    }
    async move(from, to, options = {}) {
        await this.copy(from, to, options);
        await this.delete(from, options);
    }
    async size(filePath, options = {}) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.config.bucket,
                Key: filePath,
            });
            const response = await this.s3Client.send(command);
            return response.ContentLength || 0;
        }
        catch (error) {
            if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'NotFound') {
                throw new common_1.NotFoundException(`File not found: ${filePath}`);
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new common_1.InternalServerErrorException(`Failed to get file size: ${errorMessage}`);
        }
    }
    async generateUrl(filePath, options = {}) {
        if (this.config.baseUrl) {
            return `${this.config.baseUrl}/${filePath}`;
        }
        if (options.visibility === 'public') {
            return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${filePath}`;
        }
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.config.bucket,
            Key: filePath,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 3600 });
    }
};
exports.S3Driver = S3Driver;
exports.S3Driver = S3Driver = __decorate([
    (0, common_1.Injectable)()
], S3Driver);
//# sourceMappingURL=s3.driver.js.map