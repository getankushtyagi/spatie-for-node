import { Module, DynamicModule } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaConversion } from './entities/media-conversion.entity';
import { StorageModule } from '../storage/storage.module';
import { ImageProcessor } from './processors/image.processor';
import { VideoProcessor } from './processors/video.processor';

export interface MediaModuleOptions {
    controllers?: boolean;
    storage?: {
        default: 'local' | 's3';
        local?: {
            rootPath: string;
            baseUrl?: string;
        };
        s3?: {
            bucket: string;
            region: string;
            accessKeyId?: string;
            secretAccessKey?: string;
            baseUrl?: string;
        };
    };
}

@Module({})
export class MediaModule {
    static register(options: MediaModuleOptions = { controllers: true }): DynamicModule {
        return {
            module: MediaModule,
            imports: [
                TypeOrmModule.forFeature([Media, MediaConversion]),
                StorageModule.register(options.storage),
            ],
            providers: [MediaService, ImageProcessor, VideoProcessor],
            controllers: options.controllers ? [MediaController] : [],
            exports: [MediaService],
        };
    }
}
