import { ImageProcessingOptions } from '../interfaces/media.interfaces';
import sharp from 'sharp';
export declare class ImageProcessor {
    process(buffer: Buffer, options: ImageProcessingOptions): Promise<{
        buffer: Buffer;
        width?: number;
        height?: number;
    }>;
    getMetadata(buffer: Buffer): Promise<sharp.Metadata>;
    generateThumbnail(buffer: Buffer, width?: number, height?: number): Promise<Buffer>;
}
