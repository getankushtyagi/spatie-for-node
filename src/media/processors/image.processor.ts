import { Injectable } from '@nestjs/common';
import { ImageProcessingOptions } from '../interfaces/media.interfaces';
import sharp from 'sharp';

@Injectable()
export class ImageProcessor {
    async process(
        buffer: Buffer,
        options: ImageProcessingOptions,
    ): Promise<{ buffer: Buffer; width?: number; height?: number }> {
        let image = sharp(buffer);

        // Resize if specified
        if (options.resize) {
            const { width, height, fit = 'cover' } = options.resize;
            image = image.resize(width, height, { fit });
        }

        // Set quality if specified
        if (options.quality) {
            image = image.jpeg({ quality: options.quality });
        }

        // Convert format if specified
        if (options.format) {
            switch (options.format) {
                case 'jpeg':
                    image = image.jpeg({ quality: options.quality || 80 });
                    break;
                case 'png':
                    image = image.png();
                    break;
                case 'webp':
                    image = image.webp({ quality: options.quality || 80 });
                    break;
                case 'avif':
                    image = image.avif({ quality: options.quality || 80 });
                    break;
            }
        }

        // Apply watermark if specified
        if (options.watermark) {
            const { image: watermarkBuffer, position = 'bottom-right', opacity = 0.5 } = options.watermark;

            let gravity: any = 'southeast'; // default to bottom-right
            switch (position) {
                case 'top-left':
                    gravity = 'northwest';
                    break;
                case 'top-right':
                    gravity = 'northeast';
                    break;
                case 'bottom-left':
                    gravity = 'southwest';
                    break;
                case 'bottom-right':
                    gravity = 'southeast';
                    break;
                case 'center':
                    gravity = 'center';
                    break;
            }

            const watermark = await sharp(watermarkBuffer)
                .composite([{ input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: 'dest-in' }])
                .png()
                .toBuffer();

            image = image.composite([{ input: watermark, gravity }]);
        }

        const processedBuffer = await image.toBuffer();
        const metadata = await sharp(processedBuffer).metadata();

        return {
            buffer: processedBuffer,
            width: metadata.width,
            height: metadata.height,
        };
    }

    async getMetadata(buffer: Buffer): Promise<sharp.Metadata> {
        return sharp(buffer).metadata();
    }

    async generateThumbnail(buffer: Buffer, width: number = 150, height: number = 150): Promise<Buffer> {
        return sharp(buffer)
            .resize(width, height, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toBuffer();
    }
}