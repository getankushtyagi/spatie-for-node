"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PermissionsModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsModule = void 0;
const common_1 = require("@nestjs/common");
const permissions_service_1 = require("./permissions.service");
const permissions_controller_1 = require("./permissions.controller");
const typeorm_1 = require("@nestjs/typeorm");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const role_permission_entity_1 = require("./entities/role-permission.entity");
const user_role_entity_1 = require("./entities/user-role.entity");
let PermissionsModule = PermissionsModule_1 = class PermissionsModule {
    static register(options = {}) {
        return {
            module: PermissionsModule_1,
            imports: [
                typeorm_1.TypeOrmModule.forFeature([role_entity_1.Role, permission_entity_1.Permission, role_permission_entity_1.RolePermission, user_role_entity_1.UserRole]),
            ],
            providers: [permissions_service_1.PermissionsService],
            controllers: options.controllers ? [permissions_controller_1.PermissionsController] : [],
            exports: [permissions_service_1.PermissionsService],
        };
    }
};
exports.PermissionsModule = PermissionsModule;
exports.PermissionsModule = PermissionsModule = PermissionsModule_1 = __decorate([
    (0, common_1.Module)({})
], PermissionsModule);
//# sourceMappingURL=permissions.module.js.map