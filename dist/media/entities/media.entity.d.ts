import { MediaConversion } from './media-conversion.entity';
export declare class Media {
    id: number;
    name: string;
    fileName: string;
    mimeType: string;
    size: number;
    disk: string;
    path: string;
    url: string;
    collection: string;
    alt: string;
    title: string;
    customProperties: Record<string, any>;
    conversions: MediaConversion[];
    createdAt: Date;
    updatedAt: Date;
}
