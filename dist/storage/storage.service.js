"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const local_driver_1 = require("./drivers/local.driver");
const s3_driver_1 = require("./drivers/s3.driver");
let StorageService = class StorageService {
    constructor(options, localDriver, s3Driver) {
        this.options = options;
        this.localDriver = localDriver;
        this.s3Driver = s3Driver;
        this.drivers = new Map();
        this.initializeDrivers();
    }
    initializeDrivers() {
        if (this.options.local) {
            this.localDriver.configure(this.options.local);
            this.drivers.set('local', this.localDriver);
        }
        if (this.options.s3) {
            this.s3Driver.configure(this.options.s3);
            this.drivers.set('s3', this.s3Driver);
        }
    }
    getDriver(disk) {
        const diskName = disk || this.options.default || 'local';
        const driver = this.drivers.get(diskName);
        if (!driver) {
            throw new common_1.BadRequestException(`Storage driver '${diskName}' not configured`);
        }
        return driver;
    }
    async put(path, content, options = {}) {
        const driver = this.getDriver(options.disk);
        return driver.put(path, content, options);
    }
    async get(path, options = {}) {
        const driver = this.getDriver(options.disk);
        return driver.get(path, options);
    }
    async delete(path, options = {}) {
        const driver = this.getDriver(options.disk);
        return driver.delete(path, options);
    }
    async exists(path, options = {}) {
        const driver = this.getDriver(options.disk);
        return driver.exists(path, options);
    }
    async url(path, options = {}) {
        const driver = this.getDriver(options.disk);
        return driver.url(path, options);
    }
    async copy(from, to, options = {}) {
        const driver = this.getDriver(options.disk);
        return driver.copy(from, to, options);
    }
    async move(from, to, options = {}) {
        const driver = this.getDriver(options.disk);
        return driver.move(from, to, options);
    }
    async size(path, options = {}) {
        const driver = this.getDriver(options.disk);
        return driver.size(path, options);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('STORAGE_OPTIONS')),
    __metadata("design:paramtypes", [Object, local_driver_1.LocalDriver,
        s3_driver_1.S3Driver])
], StorageService);
//# sourceMappingURL=storage.service.js.map