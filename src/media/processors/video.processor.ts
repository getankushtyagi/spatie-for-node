import { Injectable } from '@nestjs/common';
import { VideoProcessingOptions } from '../interfaces/media.interfaces';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

@Injectable()
export class VideoProcessor {
    async process(
        buffer: Buffer,
        options: VideoProcessingOptions,
    ): Promise<{ buffer: Buffer }> {
        return new Promise((resolve, reject) => {
            const inputStream = new Readable();
            inputStream.push(buffer);
            inputStream.push(null);

            const chunks: Buffer[] = [];

            let command = ffmpeg(inputStream);

            // Resize if specified
            if (options.resize) {
                const { width, height } = options.resize;
                if (width && height) {
                    command = command.size(`${width}x${height}`);
                } else if (width) {
                    command = command.size(`${width}x?`);
                } else if (height) {
                    command = command.size(`?x${height}`);
                }
            }

            // Set format
            if (options.format) {
                command = command.format(options.format);
            }

            // Set compression
            if (options.compression) {
                const crf = options.compression === 'low' ? 18 : options.compression === 'medium' ? 23 : 28;
                command = command.outputOptions([`-crf ${crf}`]);
            }

            command
                .on('error', (err) => reject(err))
                .on('end', () => {
                    const outputBuffer = Buffer.concat(chunks);
                    resolve({ buffer: outputBuffer });
                })
                .pipe()
                .on('data', (chunk) => chunks.push(chunk));
        });
    }

    async generateThumbnail(buffer: Buffer, timeInSeconds: number = 1): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const inputStream = new Readable();
            inputStream.push(buffer);
            inputStream.push(null);

            const chunks: Buffer[] = [];

            ffmpeg(inputStream)
                .seekInput(timeInSeconds)
                .frames(1)
                .format('image2')
                .outputOptions(['-vf scale=320:240'])
                .on('error', (err) => reject(err))
                .on('end', () => {
                    const thumbnailBuffer = Buffer.concat(chunks);
                    resolve(thumbnailBuffer);
                })
                .pipe()
                .on('data', (chunk) => chunks.push(chunk));
        });
    }

    async getMetadata(buffer: Buffer): Promise<any> {
        return new Promise((resolve, reject) => {
            const inputStream = new Readable();
            inputStream.push(buffer);
            inputStream.push(null);

            ffmpeg(inputStream)
                .ffprobe((err, metadata) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(metadata);
                    }
                });
        });
    }
}