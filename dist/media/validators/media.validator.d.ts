export declare class MediaValidator {
    static validateImage(file: Express.Multer.File): void;
    static validateVideo(file: Express.Multer.File): void;
    static validateFile(file: Express.Multer.File, allowedTypes?: string[], maxSize?: number): void;
}
