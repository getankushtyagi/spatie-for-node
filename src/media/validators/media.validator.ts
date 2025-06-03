import { BadRequestException } from '@nestjs/common';

export class MediaValidator {
    static validateImage(file: Express.Multer.File): void {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedMimes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid image type. Allowed types: ${allowedMimes.join(', ')}`);
        }

        if (file.size > maxSize) {
            throw new BadRequestException('Image size too large. Maximum size is 10MB');
        }
    }

    static validateVideo(file: Express.Multer.File): void {
        const allowedMimes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (!allowedMimes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid video type. Allowed types: ${allowedMimes.join(', ')}`);
        }

        if (file.size > maxSize) {
            throw new BadRequestException('Video size too large. Maximum size is 100MB');
        }
    }

    static validateFile(file: Express.Multer.File, allowedTypes?: string[], maxSize?: number): void {
        if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        if (maxSize && file.size > maxSize) {
            throw new BadRequestException(`File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
        }
    }
}