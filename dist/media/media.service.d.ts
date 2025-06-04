import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { MediaConversion } from './entities/media-conversion.entity';
import { StorageService } from '../storage/storage.service';
import { ImageProcessor } from './processors/image.processor';
import { VideoProcessor } from './processors/video.processor';
import { MediaUploadOptions, MediaCollectionOptions, MediaConversionOptions } from './interfaces/media.interfaces';
export declare class MediaService {
    private mediaRepository;
    private mediaConversionRepository;
    private storageService;
    private imageProcessor;
    private videoProcessor;
    constructor(mediaRepository: Repository<Media>, mediaConversionRepository: Repository<MediaConversion>, storageService: StorageService, imageProcessor: ImageProcessor, videoProcessor: VideoProcessor);
    upload(file: Express.Multer.File, options?: MediaUploadOptions): Promise<Media>;
    uploadMultiple(files: Express.Multer.File[], options?: MediaUploadOptions): Promise<Media[]>;
    findById(id: number): Promise<Media>;
    findByCollection(collection: string): Promise<Media[]>;
    findAll(options?: {
        page?: number;
        limit?: number;
        collection?: string;
        mimeType?: string;
    }): Promise<{
        data: Media[];
        total: number;
        page: number;
        limit: number;
    }>;
    delete(id: number): Promise<void>;
    addConversion(mediaId: number, conversionOptions: MediaConversionOptions): Promise<MediaConversion>;
    getConversion(mediaId: number, conversionName: string): Promise<MediaConversion>;
    registerCollection(options: MediaCollectionOptions): Promise<void>;
    private generateFileName;
    private changeFileExtension;
    private generateVideoThumbnail;
}
