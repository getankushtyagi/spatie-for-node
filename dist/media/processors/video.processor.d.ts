import { VideoProcessingOptions } from '../interfaces/media.interfaces';
export declare class VideoProcessor {
    process(buffer: Buffer, options: VideoProcessingOptions): Promise<{
        buffer: Buffer;
    }>;
    generateThumbnail(buffer: Buffer, timeInSeconds?: number): Promise<Buffer>;
    getMetadata(buffer: Buffer): Promise<any>;
}
