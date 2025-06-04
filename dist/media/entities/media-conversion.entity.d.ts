import { Media } from './media.entity';
export declare class MediaConversion {
    id: number;
    mediaId: number;
    name: string;
    fileName: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
    width: number;
    height: number;
    media: Media;
    createdAt: Date;
}
