"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalDriver = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
let LocalDriver = class LocalDriver {
    configure(config) {
        this.config = config;
        this.ensureDirectoryExists(this.config.rootPath);
    }
    async put(filePath, content, options = {}) {
        const fullPath = path.join(this.config.rootPath, filePath);
        const directory = path.dirname(fullPath);
        await this.ensureDirectoryExists(directory);
        await fs.writeFile(fullPath, content);
        const stats = await fs.stat(fullPath);
        const url = this.generateUrl(filePath);
        return {
            path: filePath,
            url,
            size: stats.size,
        };
    }
    async get(filePath, options = {}) {
        const fullPath = path.join(this.config.rootPath, filePath);
        if (!(0, fs_1.existsSync)(fullPath)) {
            throw new common_1.NotFoundException(`File not found: ${filePath}`);
        }
        return fs.readFile(fullPath);
    }
    async delete(filePath, options = {}) {
        const fullPath = path.join(this.config.rootPath, filePath);
        if ((0, fs_1.existsSync)(fullPath)) {
            await fs.unlink(fullPath);
        }
    }
    async exists(filePath, options = {}) {
        const fullPath = path.join(this.config.rootPath, filePath);
        return (0, fs_1.existsSync)(fullPath);
    }
    async url(filePath, options = {}) {
        return this.generateUrl(filePath);
    }
    async copy(from, to, options = {}) {
        const fromPath = path.join(this.config.rootPath, from);
        const toPath = path.join(this.config.rootPath, to);
        if (!(0, fs_1.existsSync)(fromPath)) {
            throw new common_1.NotFoundException(`Source file not found: ${from}`);
        }
        const directory = path.dirname(toPath);
        await this.ensureDirectoryExists(directory);
        await fs.copyFile(fromPath, toPath);
    }
    async move(from, to, options = {}) {
        await this.copy(from, to, options);
        await this.delete(from, options);
    }
    async size(filePath, options = {}) {
        const fullPath = path.join(this.config.rootPath, filePath);
        if (!(0, fs_1.existsSync)(fullPath)) {
            throw new common_1.NotFoundException(`File not found: ${filePath}`);
        }
        const stats = await fs.stat(fullPath);
        return stats.size;
    }
    async ensureDirectoryExists(dirPath) {
        if (!(0, fs_1.existsSync)(dirPath)) {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }
    generateUrl(filePath) {
        if (this.config.baseUrl) {
            return `${this.config.baseUrl}/${filePath}`.replace(/\/+/g, '/');
        }
        return `/storage/${filePath}`;
    }
};
exports.LocalDriver = LocalDriver;
exports.LocalDriver = LocalDriver = __decorate([
    (0, common_1.Injectable)()
], LocalDriver);
//# sourceMappingURL=local.driver.js.map