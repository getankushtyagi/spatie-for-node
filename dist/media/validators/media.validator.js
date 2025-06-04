"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaValidator = void 0;
const common_1 = require("@nestjs/common");
class MediaValidator {
    static validateImage(file) {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024;
        if (!allowedMimes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid image type. Allowed types: ${allowedMimes.join(', ')}`);
        }
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('Image size too large. Maximum size is 10MB');
        }
    }
    static validateVideo(file) {
        const allowedMimes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
        const maxSize = 100 * 1024 * 1024;
        if (!allowedMimes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid video type. Allowed types: ${allowedMimes.join(', ')}`);
        }
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('Video size too large. Maximum size is 100MB');
        }
    }
    static validateFile(file, allowedTypes, maxSize) {
        if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }
        if (maxSize && file.size > maxSize) {
            throw new common_1.BadRequestException(`File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
        }
    }
}
exports.MediaValidator = MediaValidator;
//# sourceMappingURL=media.validator.js.map