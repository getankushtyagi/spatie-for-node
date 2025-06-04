"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("./entities/media.entity");
const media_conversion_entity_1 = require("./entities/media-conversion.entity");
const storage_service_1 = require("../storage/storage.service");
const image_processor_1 = require("./processors/image.processor");
const video_processor_1 = require("./processors/video.processor");
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
const mime = __importStar(require("mime-types"));
let MediaService = class MediaService {
    constructor(mediaRepository, mediaConversionRepository, storageService, imageProcessor, videoProcessor) {
        this.mediaRepository = mediaRepository;
        this.mediaConversionRepository = mediaConversionRepository;
        this.storageService = storageService;
        this.imageProcessor = imageProcessor;
        this.videoProcessor = videoProcessor;
    }
    async upload(file, options = {}) {
        const { disk = 'local', directory = 'uploads', fileName = this.generateFileName(file), processImage = true, imageOptions = {
            resize: { width: 1200 },
            quality: 80,
            format: 'jpeg',
        }, processVideo = false, videoOptions = {
            resize: { width: 1280 },
            format: 'mp4',
            compression: 'medium',
            generateThumbnail: true,
        }, collection = 'default', alt, title, customProperties, } = options;
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('File is required');
        }
        const fileType = mime.lookup(file.originalname) || 'application/octet-stream';
        const isImage = fileType.startsWith('image/');
        const isVideo = fileType.startsWith('video/');
        let processedBuffer = file.buffer;
        let processedFileName = fileName;
        if (isImage && processImage) {
            const processed = await this.imageProcessor.process(file.buffer, imageOptions);
            processedBuffer = processed.buffer;
            if (imageOptions.format) {
                const ext = imageOptions.format === 'jpeg' ? 'jpg' : imageOptions.format;
                processedFileName = this.changeFileExtension(fileName, ext);
            }
        }
        if (isVideo && processVideo) {
            const processed = await this.videoProcessor.process(file.buffer, videoOptions);
            processedBuffer = processed.buffer;
            if (videoOptions.format) {
                processedFileName = this.changeFileExtension(fileName, videoOptions.format);
            }
        }
        const filePath = path.join(directory, processedFileName).replace(/\\/g, '/');
        const uploadResult = await this.storageService.put(filePath, processedBuffer, {
            disk,
            contentType: mime.lookup(processedFileName) || 'application/octet-stream',
        });
        const media = this.mediaRepository.create({
            name: processedFileName,
            fileName: processedFileName,
            mimeType: mime.lookup(processedFileName) || 'application/octet-stream',
            size: processedBuffer.length,
            disk,
            path: filePath,
            url: uploadResult.url,
            collection,
            alt,
            title,
            customProperties: customProperties || {},
        });
        const savedMedia = await this.mediaRepository.save(media);
        if (isVideo && processVideo && videoOptions.generateThumbnail) {
            await this.generateVideoThumbnail(savedMedia, videoOptions.thumbnailTime || 1);
        }
        return savedMedia;
    }
    async uploadMultiple(files, options = {}) {
        const uploadPromises = files.map(file => this.upload(file, options));
        return Promise.all(uploadPromises);
    }
    async findById(id) {
        const media = await this.mediaRepository.findOne({
            where: { id },
            relations: ['conversions'],
        });
        if (!media) {
            throw new common_1.NotFoundException(`Media with ID ${id} not found`);
        }
        return media;
    }
    async findByCollection(collection) {
        return this.mediaRepository.find({
            where: { collection },
            relations: ['conversions'],
            order: { createdAt: 'DESC' },
        });
    }
    async findAll(options = {}) {
        const { page = 1, limit = 20, collection, mimeType } = options;
        const skip = (page - 1) * limit;
        const queryBuilder = this.mediaRepository.createQueryBuilder('media')
            .leftJoinAndSelect('media.conversions', 'conversions')
            .orderBy('media.createdAt', 'DESC');
        if (collection) {
            queryBuilder.andWhere('media.collection = :collection', { collection });
        }
        if (mimeType) {
            queryBuilder.andWhere('media.mimeType LIKE :mimeType', { mimeType: `${mimeType}%` });
        }
        const [data, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return { data, total, page, limit };
    }
    async delete(id) {
        const media = await this.findById(id);
        await this.mediaConversionRepository.delete({ mediaId: id });
        await this.storageService.delete(media.path, { disk: media.disk });
        for (const conversion of media.conversions || []) {
            try {
                await this.storageService.delete(conversion.path, { disk: media.disk });
            }
            catch (error) {
                console.warn(`Failed to delete conversion file: ${conversion.path}`, error);
            }
        }
        await this.mediaRepository.delete(id);
    }
    async addConversion(mediaId, conversionOptions) {
        const media = await this.findById(mediaId);
        if (!media.mimeType.startsWith('image/')) {
            throw new common_1.BadRequestException('Conversions are only supported for images');
        }
        const originalBuffer = await this.storageService.get(media.path, { disk: media.disk });
        const processed = await this.imageProcessor.process(originalBuffer, {
            resize: {
                width: conversionOptions.width,
                height: conversionOptions.height,
                fit: conversionOptions.fit,
            },
            quality: conversionOptions.quality,
            format: conversionOptions.format,
        });
        const ext = conversionOptions.format || path.extname(media.fileName).slice(1);
        const baseName = path.parse(media.fileName).name;
        const conversionFileName = `${baseName}_${conversionOptions.name}.${ext}`;
        const conversionPath = path.join(path.dirname(media.path), conversionFileName).replace(/\\/g, '/');
        const uploadResult = await this.storageService.put(conversionPath, processed.buffer, {
            disk: media.disk,
            contentType: mime.lookup(conversionFileName) || 'application/octet-stream',
        });
        const conversion = this.mediaConversionRepository.create({
            mediaId,
            name: conversionOptions.name,
            fileName: conversionFileName,
            mimeType: mime.lookup(conversionFileName) || 'application/octet-stream',
            size: processed.buffer.length,
            path: conversionPath,
            url: uploadResult.url,
            width: processed.width,
            height: processed.height,
        });
        return this.mediaConversionRepository.save(conversion);
    }
    async getConversion(mediaId, conversionName) {
        const conversion = await this.mediaConversionRepository.findOne({
            where: { mediaId, name: conversionName },
        });
        if (!conversion) {
            throw new common_1.NotFoundException(`Conversion '${conversionName}' not found for media ${mediaId}`);
        }
        return conversion;
    }
    async registerCollection(options) {
        console.log(`Registered collection: ${options.name}`);
    }
    generateFileName(file) {
        const ext = path.extname(file.originalname);
        const name = path.parse(file.originalname).name;
        const uuid = (0, uuid_1.v4)();
        return `${name}_${uuid}${ext}`;
    }
    changeFileExtension(fileName, newExt) {
        const parsed = path.parse(fileName);
        return `${parsed.name}.${newExt}`;
    }
    async generateVideoThumbnail(media, time) {
        try {
            const videoBuffer = await this.storageService.get(media.path, { disk: media.disk });
            const thumbnail = await this.videoProcessor.generateThumbnail(videoBuffer, time);
            const thumbnailFileName = `${path.parse(media.fileName).name}_thumb.jpg`;
            const thumbnailPath = path.join(path.dirname(media.path), thumbnailFileName).replace(/\\/g, '/');
            const uploadResult = await this.storageService.put(thumbnailPath, thumbnail, {
                disk: media.disk,
                contentType: 'image/jpeg',
            });
            const conversion = this.mediaConversionRepository.create({
                mediaId: media.id,
                name: 'thumbnail',
                fileName: thumbnailFileName,
                mimeType: 'image/jpeg',
                size: thumbnail.length,
                path: thumbnailPath,
                url: uploadResult.url,
            });
            await this.mediaConversionRepository.save(conversion);
        }
        catch (error) {
            console.warn(`Failed to generate thumbnail for video ${media.id}:`, error);
        }
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __param(1, (0, typeorm_1.InjectRepository)(media_conversion_entity_1.MediaConversion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        storage_service_1.StorageService,
        image_processor_1.ImageProcessor,
        video_processor_1.VideoProcessor])
], MediaService);
//# sourceMappingURL=media.service.js.map