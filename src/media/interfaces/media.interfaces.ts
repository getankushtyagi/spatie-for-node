export interface MediaUploadOptions {
    disk?: string;
    directory?: string;
    fileName?: string;
    processImage?: boolean;
    imageOptions?: ImageProcessingOptions;
    processVideo?: boolean;
    videoOptions?: VideoProcessingOptions;
    collection?: string;
    alt?: string;
    title?: string;
    customProperties?: Record<string, any>;
}

export interface ImageProcessingOptions {
    resize?: {
        width?: number;
        height?: number;
        fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    };
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    watermark?: {
        image: Buffer;
        position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
        opacity?: number;
    };
}

export interface VideoProcessingOptions {
    resize?: {
        width?: number;
        height?: number;
    };
    format?: 'mp4' | 'webm';
    compression?: 'low' | 'medium' | 'high';
    generateThumbnail?: boolean;
    thumbnailTime?: number; // seconds
}

export interface MediaCollectionOptions {
    name: string;
    disk?: string;
    conversions?: MediaConversionOptions[];
}

export interface MediaConversionOptions {
    name: string;
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}