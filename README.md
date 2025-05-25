# spatie-for-node

Essential modules for NestJS applications providing **Permissions (RBAC)**, **Media Management**, and **Storage Abstraction**.

## 🚀 Features

- **🔐 Permissions Module**: Complete Role-Based Access Control (RBAC) system
- **📁 Media Module**: File uploads, image/video processing, and asset management
- **💾 Storage Module**: Flexible storage abstraction supporting Local and S3 drivers
- **🛡️ Guards & Decorators**: Ready-to-use permission guards and decorators
- **📊 TypeORM Integration**: Built-in entities and repositories
- **🎯 TypeScript Support**: Full TypeScript support with type definitions

## 📦 Installation

```bash
npm install spatie-for-node
```

### Required Peer Dependencies

```bash
npm install @nestjs/common @nestjs/core @nestjs/typeorm @nestjs/platform-express typeorm reflect-metadata
```

### Optional Dependencies (for Media & Storage)

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp fluent-ffmpeg mime-types uuid
```

## 🏗️ Quick Start

### 1. Basic Setup

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule, MediaModule } from 'spatie-for-node';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // Your TypeORM configuration
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your_username',
      password: 'your_password',
      database: 'your_database',
      autoLoadEntities: true,
      synchronize: true, // Don't use in production
    }),
    
    // Enable Permissions Module
    PermissionsModule.register({
      controllers: true, // Enables REST API endpoints
    }),
    
    // Enable Media Module
    MediaModule.register({
      controllers: true,
      storage: {
        default: 'local',
        local: {
          rootPath: './uploads',
          baseUrl: 'http://localhost:3000/uploads',
        },
      },
    }),
  ],
})
export class AppModule {}
```

## 🔐 Permissions Module

### Features
- Role-based access control (RBAC)
- Permission management
- User role assignments
- Guards and decorators for route protection
- RESTful API endpoints (optional)

### Entities

The module includes these TypeORM entities:
- `Role` - System roles
- `Permission` - Individual permissions
- `RolePermission` - Role-permission associations
- `UserRole` - User-role assignments

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { PermissionsService } from 'spatie-for-node';

@Injectable()
export class UserService {
  constructor(private readonly permissionsService: PermissionsService) {}

  async setupUserPermissions(userId: number) {
    // Create a role
    const role = await this.permissionsService.createRole({
      name: 'editor',
      description: 'Content editor role'
    });

    // Create permissions
    const permission = await this.permissionsService.createPermission({
      name: 'edit:posts',
      description: 'Can edit posts'
    });

    // Assign permission to role
    await this.permissionsService.assignPermissionToRole(role.id, permission.id);

    // Assign role to user
    await this.permissionsService.assignRoleToUser(userId, role.id);

    // Check user permission
    const hasPermission = await this.permissionsService.hasPermission(userId, 'edit:posts');
    console.log('User can edit posts:', hasPermission);
  }
}
```

### Guards & Decorators

Protect your routes with declarative permission checks:

```typescript
import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { 
  PermissionGuard, 
  RequiresPermissions, 
  RequiresRoles,
  RequiresAllPermissions,
  RequiresAnyRole 
} from 'spatie-for-node';

@Controller('admin')
@UseGuards(PermissionGuard)
export class AdminController {
  
  @Get('dashboard')
  @RequiresPermissions('view:dashboard')
  async getDashboard(@Request() req) {
    return { message: `Welcome ${req.user.id}!` };
  }

  @Post('users')
  @RequiresAllPermissions('create:users', 'manage:users')
  async createUser() {
    return { message: 'User created successfully' };
  }

  @Get('reports')
  @RequiresAnyRole('admin', 'manager', 'analyst')
  async getReports() {
    return { message: 'Here are your reports' };
  }
}
```

### Available Decorators

| Decorator | Description |
|-----------|-------------|
| `@RequiresPermissions(...permissions)` | User must have any of the specified permissions |
| `@RequiresAllPermissions(...permissions)` | User must have all specified permissions |
| `@RequiresAnyPermission(...permissions)` | User must have any of the specified permissions |
| `@RequiresRoles(...roles)` | User must have any of the specified roles |
| `@RequiresAllRoles(...roles)` | User must have all specified roles |
| `@RequiresAnyRole(...roles)` | User must have any of the specified roles |

### REST API Endpoints

When `controllers: true` is enabled, these endpoints are available under `/permissions`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/permissions/roles` | List all roles |
| `POST` | `/permissions/roles` | Create a new role |
| `GET` | `/permissions/roles/:id` | Get role by ID |
| `PUT` | `/permissions/roles/:id` | Update role |
| `DELETE` | `/permissions/roles/:id` | Delete role |
| `GET` | `/permissions/permissions` | List all permissions |
| `POST` | `/permissions/permissions` | Create a new permission |
| `POST` | `/permissions/users/:userId/roles` | Assign role to user |
| `DELETE` | `/permissions/users/:userId/roles/:roleId` | Remove role from user |

## 📁 Media Module

### Features
- File upload handling
- Image processing (resize, format conversion, quality adjustment)
- Video processing
- Multiple storage drivers (Local, S3)
- Automatic file type detection
- Media collections and organization
- Conversion management

### Configuration

```typescript
MediaModule.register({
  controllers: true,
  storage: {
    default: 'local',
    local: {
      rootPath: './uploads',
      baseUrl: 'http://localhost:3000/uploads',
    },
    s3: {
      bucket: 'your-s3-bucket',
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      baseUrl: 'https://cdn.example.com', // Optional CDN URL
    },
  },
})
```

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { MediaService, MediaUploadOptions } from 'spatie-for-node';

@Injectable()
export class GalleryService {
  constructor(private readonly mediaService: MediaService) {}

  async uploadProfileImage(file: Express.Multer.File, userId: number) {
    const options: MediaUploadOptions = {
      directory: `users/${userId}`,
      processImage: true,
      imageOptions: {
        resize: { width: 300, height: 300, fit: 'cover' },
        quality: 85,
        format: 'webp',
      },
      collection: 'profile-images',
      metadata: { userId },
    };

    return this.mediaService.upload(file, options);
  }

  async createImageVariants(mediaId: number) {
    // Create thumbnail
    await this.mediaService.createConversion(mediaId, 'thumbnail', {
      resize: { width: 150, height: 150, fit: 'cover' },
      quality: 80,
    });

    // Create large version
    await this.mediaService.createConversion(mediaId, 'large', {
      resize: { width: 1200, height: 800, fit: 'inside' },
      quality: 90,
    });
  }

  async getGalleryImages() {
    return this.mediaService.findByCollection('profile-images', {
      page: 1,
      limit: 20,
    });
  }
}
```

### Image Processing Options

```typescript
interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  quality?: number; // 1-100
  format?: 'jpeg' | 'png' | 'webp' | 'tiff';
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
}
```

### REST API Endpoints

When `controllers: true` is enabled:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/media/upload` | Upload single file |
| `POST` | `/media/upload-multiple` | Upload multiple files |
| `GET` | `/media` | List media with pagination |
| `GET` | `/media/collections/:collection` | Get media by collection |
| `GET` | `/media/:id` | Get media item by ID |
| `DELETE` | `/media/:id` | Delete media item |
| `POST` | `/media/:id/conversions` | Create new conversion |
| `GET` | `/media/:id/conversions/:name` | Get specific conversion |

## 💾 Storage Module

### Features
- Multiple storage drivers (Local, S3)
- Unified API across different storage types
- File operations (put, get, delete, exists)
- URL generation
- Configurable per operation

### Independent Usage

```typescript
import { StorageModule } from 'spatie-for-node';

@Module({
  imports: [
    StorageModule.register({
      default: 's3',
      local: {
        rootPath: './files',
        baseUrl: 'http://localhost:3000/files',
      },
      s3: {
        bucket: 'my-app-storage',
        region: 'us-west-2',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    }),
  ],
})
export class AppModule {}
```

### StorageService Usage

```typescript
import { Injectable } from '@nestjs/common';
import { StorageService } from 'spatie-for-node';

@Injectable()
export class DocumentService {
  constructor(private readonly storageService: StorageService) {}

  async saveDocument(fileName: string, content: Buffer) {
    // Save to default storage
    await this.storageService.put(`documents/${fileName}`, content);

    // Save to specific storage
    await this.storageService.put(
      `backups/${fileName}`, 
      content, 
      { disk: 's3', contentType: 'application/pdf' }
    );
  }

  async getDocumentUrl(fileName: string): Promise<string> {
    return this.storageService.url(`documents/${fileName}`);
  }

  async documentExists(fileName: string): Promise<boolean> {
    return this.storageService.exists(`documents/${fileName}`);
  }

  async deleteDocument(fileName: string): Promise<void> {
    await this.storageService.delete(`documents/${fileName}`);
  }

  async getDocumentContent(fileName: string): Promise<Buffer> {
    return this.storageService.get(`documents/${fileName}`);
  }
}
```

## 🔧 Advanced Configuration

### Environment Variables

Create a `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1

# Media
MEDIA_BASE_URL=http://localhost:3000/uploads
MEDIA_UPLOAD_PATH=./uploads
```

### Custom User Entity Integration

If you have a custom User entity:

```typescript
// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from 'spatie-for-node';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];
}

// app.module.ts
PermissionsModule.register({
  controllers: true,
  userEntity: User, // Reference your custom User entity
}),
```

## 🧪 Testing

### Unit Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService, MediaService } from 'spatie-for-node';

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionsService],
      // Add your test configuration
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should create a role', async () => {
    const role = await service.createRole({
      name: 'test-role',
      description: 'Test role'
    });
    
    expect(role).toBeDefined();
    expect(role.name).toBe('test-role');
  });
});
```

## 🚀 Development Scripts

```bash
# Build the package
npm run build

# Development mode with watch
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📚 Examples

### Complete Application Example

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PermissionsModule, MediaModule } from 'spatie-for-node';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    PermissionsModule.register({
      controllers: true,
    }),
    MediaModule.register({
      controllers: true,
      storage: {
        default: 'local',
        local: {
          rootPath: './uploads',
          baseUrl: 'http://localhost:3000/uploads',
        },
        s3: {
          bucket: process.env.AWS_S3_BUCKET,
          region: process.env.AWS_S3_REGION,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      },
    }),
  ],
})
export class AppModule {}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Build: `npm run build`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- [Report Issues](https://github.com/your-org/nest-essentials/issues)
- [Feature Requests](https://github.com/your-org/nest-essentials/issues/new?template=feature_request.md)
- [Documentation](https://docs.your-org.com/nest-essentials)

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

---

**Made with ❤️ for the NestJS community**