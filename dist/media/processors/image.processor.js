"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessor = void 0;
const common_1 = require("@nestjs/common");
const sharp_1 = __importDefault(require("sharp"));
let ImageProcessor = class ImageProcessor {
    async process(buffer, options) {
        let image = (0, sharp_1.default)(buffer);
        if (options.resize) {
            const { width, height, fit = 'cover' } = options.resize;
            image = image.resize(width, height, { fit });
        }
        if (options.quality) {
            image = image.jpeg({ quality: options.quality });
        }
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
        if (options.watermark) {
            const { image: watermarkBuffer, position = 'bottom-right', opacity = 0.5 } = options.watermark;
            let gravity = 'southeast';
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
            const watermark = await (0, sharp_1.default)(watermarkBuffer)
                .composite([{ input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: 'dest-in' }])
                .png()
                .toBuffer();
            image = image.composite([{ input: watermark, gravity }]);
        }
        const processedBuffer = await image.toBuffer();
        const metadata = await (0, sharp_1.default)(processedBuffer).metadata();
        return {
            buffer: processedBuffer,
            width: metadata.width,
            height: metadata.height,
        };
    }
    async getMetadata(buffer) {
        return (0, sharp_1.default)(buffer).metadata();
    }
    async generateThumbnail(buffer, width = 150, height = 150) {
        return (0, sharp_1.default)(buffer)
            .resize(width, height, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toBuffer();
    }
};
exports.ImageProcessor = ImageProcessor;
exports.ImageProcessor = ImageProcessor = __decorate([
    (0, common_1.Injectable)()
], ImageProcessor);
//# sourceMappingURL=image.processor.js.map