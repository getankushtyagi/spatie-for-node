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
exports.VideoProcessor = void 0;
const common_1 = require("@nestjs/common");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const stream_1 = require("stream");
let VideoProcessor = class VideoProcessor {
    async process(buffer, options) {
        return new Promise((resolve, reject) => {
            const inputStream = new stream_1.Readable();
            inputStream.push(buffer);
            inputStream.push(null);
            const chunks = [];
            let command = (0, fluent_ffmpeg_1.default)(inputStream);
            if (options.resize) {
                const { width, height } = options.resize;
                if (width && height) {
                    command = command.size(`${width}x${height}`);
                }
                else if (width) {
                    command = command.size(`${width}x?`);
                }
                else if (height) {
                    command = command.size(`?x${height}`);
                }
            }
            if (options.format) {
                command = command.format(options.format);
            }
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
    async generateThumbnail(buffer, timeInSeconds = 1) {
        return new Promise((resolve, reject) => {
            const inputStream = new stream_1.Readable();
            inputStream.push(buffer);
            inputStream.push(null);
            const chunks = [];
            (0, fluent_ffmpeg_1.default)(inputStream)
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
    async getMetadata(buffer) {
        return new Promise((resolve, reject) => {
            const inputStream = new stream_1.Readable();
            inputStream.push(buffer);
            inputStream.push(null);
            (0, fluent_ffmpeg_1.default)(inputStream)
                .ffprobe((err, metadata) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(metadata);
                }
            });
        });
    }
};
exports.VideoProcessor = VideoProcessor;
exports.VideoProcessor = VideoProcessor = __decorate([
    (0, common_1.Injectable)()
], VideoProcessor);
//# sourceMappingURL=video.processor.js.map