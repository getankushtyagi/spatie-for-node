import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    ParseIntPipe,
    Body,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';
import { MediaUploadOptions } from './interfaces/media.interfaces';

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() options: MediaUploadOptions,
    ): Promise<Media> {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        return this.mediaService.upload(file, options);
    }

    @Post('upload-multiple')
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() options: MediaUploadOptions,
    ): Promise<Media[]> {
        if (!files || files.length === 0) {
            throw new BadRequestException('Files are required');
        }
        return this.mediaService.uploadMultiple(files, options);
    }

    @Get()
    async getMedia(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('collection') collection?: string,
        @Query('mimeType') mimeType?: string,
    ) {
        return this.mediaService.findAll({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            collection,
            mimeType,
        });
    }

    @Get('collections/:collection')
    async getByCollection(@Param('collection') collection: string): Promise<Media[]> {
        return this.mediaService.findByCollection(collection);
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number): Promise<Media> {
        return this.mediaService.findById(id);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
        await this.mediaService.delete(id);
        return { success: true };
    }

    @Post(':id/conversions')
    async addConversion(
        @Param('id', ParseIntPipe) id: number,
        @Body() conversionOptions: any,
    ) {
        return this.mediaService.addConversion(id, conversionOptions);
    }

    @Get(':id/conversions/:name')
    async getConversion(
        @Param('id', ParseIntPipe) id: number,
        @Param('name') name: string,
    ) {
        return this.mediaService.getConversion(id, name);
    }
}