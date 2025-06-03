import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { MediaConversion } from './entities/media-conversion.entity';
import { StorageService } from '../storage/storage.service';
import { ImageProcessor } from './processors/image.processor';
import { VideoProcessor } from './processors/video.processor';
import {
    MediaUploadOptions,
    MediaCollectionOptions,
    MediaConversionOptions
} from './interfaces/media.interfaces';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as mime from 'mime-types';

@Injectable()
export class MediaService {
    constructor(
        @InjectRepository(Media)
        private mediaRepository: Repository<Media>,
        @InjectRepository(MediaConversion)
        private mediaConversionRepository: Repository<MediaConversion>,
        private storageService: StorageService,
        private imageProcessor: ImageProcessor,
        private videoProcessor: VideoProcessor,
    ) { }

    async upload(
        file: Express.Multer.File,
        options: MediaUploadOptions = {},
    ): Promise<Media> {
        const {
            disk = 'local',
            directory = 'uploads',
            fileName = this.generateFileName(file),
            processImage = true,
            imageOptions = {
                resize: { width: 1200 },
                quality: 80,
                format: 'jpeg',
            },
            processVideo = false,
            videoOptions = {
                resize: { width: 1280 },
                format: 'mp4',
                compression: 'medium',
                generateThumbnail: true,
            },
            collection = 'default',
            alt,
            title,
            customProperties,
        } = options;

        if (!file || !file.buffer) {
            throw new BadRequestException('File is required');
        }

        const fileType = mime.lookup(file.originalname) || 'application/octet-stream';
        const isImage = fileType.startsWith('image/');
        const isVideo = fileType.startsWith('video/');

        let processedBuffer = file.buffer;
        let processedFileName = fileName;

        // Process image if it's an image and processing is enabled
        if (isImage && processImage) {
            const processed = await this.imageProcessor.process(file.buffer, imageOptions);
            processedBuffer = processed.buffer;
            if (imageOptions.format) {
                const ext = imageOptions.format === 'jpeg' ? 'jpg' : imageOptions.format;
                processedFileName = this.changeFileExtension(fileName, ext);
            }
        }

        // Process video if it's a video and processing is enabled
        if (isVideo && processVideo) {
            const processed = await this.videoProcessor.process(file.buffer, videoOptions);
            processedBuffer = processed.buffer;
            if (videoOptions.format) {
                processedFileName = this.changeFileExtension(fileName, videoOptions.format);
            }
        }

        const filePath = path.join(directory, processedFileName).replace(/\\/g, '/');

        // Upload to storage
        const uploadResult = await this.storageService.put(filePath, processedBuffer, {
            disk,
            contentType: mime.lookup(processedFileName) || 'application/octet-stream',
        });

        // Create media record
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

        // Generate thumbnail for video if enabled
        if (isVideo && processVideo && videoOptions.generateThumbnail) {
            await this.generateVideoThumbnail(savedMedia, videoOptions.thumbnailTime || 1);
        }

        return savedMedia;
    }

    async uploadMultiple(
        files: Express.Multer.File[],
        options: MediaUploadOptions = {},
    ): Promise<Media[]> {
        const uploadPromises = files.map(file => this.upload(file, options));
        return Promise.all(uploadPromises);
    }

    async findById(id: number): Promise<Media> {
        const media = await this.mediaRepository.findOne({
            where: { id },
            relations: ['conversions'],
        });

        if (!media) {
            throw new NotFoundException(`Media with ID ${id} not found`);
        }

        return media;
    }

    async findByCollection(collection: string): Promise<Media[]> {
        return this.mediaRepository.find({
            where: { collection },
            relations: ['conversions'],
            order: { createdAt: 'DESC' },
        });
    }

    async findAll(options: {
        page?: number;
        limit?: number;
        collection?: string;
        mimeType?: string;
    } = {}): Promise<{ data: Media[]; total: number; page: number; limit: number }> {
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

    async delete(id: number): Promise<void> {
        const media = await this.findById(id);

        // Delete conversions first
        await this.mediaConversionRepository.delete({ mediaId: id });

        // Delete file from storage
        await this.storageService.delete(media.path, { disk: media.disk });

        // Delete conversions from storage
        for (const conversion of media.conversions || []) {
            try {
                await this.storageService.delete(conversion.path, { disk: media.disk });
            } catch (error) {
                console.warn(`Failed to delete conversion file: ${conversion.path}`, error);
            }
        }

        // Delete media record
        await this.mediaRepository.delete(id);
    }

    async addConversion(
        mediaId: number,
        conversionOptions: MediaConversionOptions,
    ): Promise<MediaConversion> {
        const media = await this.findById(mediaId);

        if (!media.mimeType.startsWith('image/')) {
            throw new BadRequestException('Conversions are only supported for images');
        }

        // Get original file
        const originalBuffer = await this.storageService.get(media.path, { disk: media.disk });

        // Process image with conversion options
        const processed = await this.imageProcessor.process(originalBuffer, {
            resize: {
                width: conversionOptions.width,
                height: conversionOptions.height,
                fit: conversionOptions.fit,
            },
            quality: conversionOptions.quality,
            format: conversionOptions.format as any,
        });

        // Generate conversion filename
        const ext = conversionOptions.format || path.extname(media.fileName).slice(1);
        const baseName = path.parse(media.fileName).name;
        const conversionFileName = `${baseName}_${conversionOptions.name}.${ext}`;
        const conversionPath = path.join(path.dirname(media.path), conversionFileName).replace(/\\/g, '/');

        // Upload conversion
        const uploadResult = await this.storageService.put(conversionPath, processed.buffer, {
            disk: media.disk,
            contentType: mime.lookup(conversionFileName) || 'application/octet-stream',
        });

        // Create conversion record
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

    async getConversion(mediaId: number, conversionName: string): Promise<MediaConversion> {
        const conversion = await this.mediaConversionRepository.findOne({
            where: { mediaId, name: conversionName },
        });

        if (!conversion) {
            throw new NotFoundException(`Conversion '${conversionName}' not found for media ${mediaId}`);
        }

        return conversion;
    }

    async registerCollection(options: MediaCollectionOptions): Promise<void> {
        // This is a placeholder for collection registration
        // In a real implementation, you might store collection configs in database
        console.log(`Registered collection: ${options.name}`);
    }

    private generateFileName(file: Express.Multer.File): string {
        const ext = path.extname(file.originalname);
        const name = path.parse(file.originalname).name;
        const uuid = uuidv4();
        return `${name}_${uuid}${ext}`;
    }

    private changeFileExtension(fileName: string, newExt: string): string {
        const parsed = path.parse(fileName);
        return `${parsed.name}.${newExt}`;
    }

    private async generateVideoThumbnail(media: Media, time: number): Promise<void> {
        try {
            const videoBuffer = await this.storageService.get(media.path, { disk: media.disk });
            const thumbnail = await this.videoProcessor.generateThumbnail(videoBuffer, time);

            const thumbnailFileName = `${path.parse(media.fileName).name}_thumb.jpg`;
            const thumbnailPath = path.join(path.dirname(media.path), thumbnailFileName).replace(/\\/g, '/');

            const uploadResult = await this.storageService.put(thumbnailPath, thumbnail, {
                disk: media.disk,
                contentType: 'image/jpeg',
            });

            // Create thumbnail conversion
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
        } catch (error) {
            console.warn(`Failed to generate thumbnail for video ${media.id}:`, error);
        }
    }
}