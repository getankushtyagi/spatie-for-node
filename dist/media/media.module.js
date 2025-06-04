"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MediaModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const media_service_1 = require("./media.service");
const media_controller_1 = require("./media.controller");
const typeorm_1 = require("@nestjs/typeorm");
const media_entity_1 = require("./entities/media.entity");
const media_conversion_entity_1 = require("./entities/media-conversion.entity");
const storage_module_1 = require("../storage/storage.module");
const image_processor_1 = require("./processors/image.processor");
const video_processor_1 = require("./processors/video.processor");
let MediaModule = MediaModule_1 = class MediaModule {
    static register(options = { controllers: true }) {
        return {
            module: MediaModule_1,
            imports: [
                typeorm_1.TypeOrmModule.forFeature([media_entity_1.Media, media_conversion_entity_1.MediaConversion]),
                storage_module_1.StorageModule.register(options.storage),
            ],
            providers: [media_service_1.MediaService, image_processor_1.ImageProcessor, video_processor_1.VideoProcessor],
            controllers: options.controllers ? [media_controller_1.MediaController] : [],
            exports: [media_service_1.MediaService],
        };
    }
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = MediaModule_1 = __decorate([
    (0, common_1.Module)({})
], MediaModule);
//# sourceMappingURL=media.module.js.map