import { MediaService } from './media.service';
import { Media } from './entities/media.entity';
import { MediaUploadOptions } from './interfaces/media.interfaces';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    uploadFile(file: Express.Multer.File, options: MediaUploadOptions): Promise<Media>;
    uploadFiles(files: Express.Multer.File[], options: MediaUploadOptions): Promise<Media[]>;
    getMedia(page?: number, limit?: number, collection?: string, mimeType?: string): Promise<{
        data: Media[];
        total: number;
        page: number;
        limit: number;
    }>;
    getByCollection(collection: string): Promise<Media[]>;
    getById(id: number): Promise<Media>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
    addConversion(id: number, conversionOptions: any): Promise<import(".").MediaConversion>;
    getConversion(id: number, name: string): Promise<import(".").MediaConversion>;
}
