import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type { Readable } from 'node:stream';

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);
  private readonly client: Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;
  private bucketReady = false;

  constructor(config: ConfigService) {
    const endPoint = config.get<string>('MINIO_ENDPOINT');
    const accessKey = config.get<string>('MINIO_ACCESS_KEY');
    const secretKey = config.get<string>('MINIO_SECRET_KEY');

    if (!endPoint || !accessKey || !secretKey) {
      throw new Error('MinIO configuration is missing');
    }

    const port = Number(config.get<string>('MINIO_PORT', '443'));
    const useSSL = config.get<string>('MINIO_USE_SSL', 'true') === 'true';

    this.bucket = config.get<string>('MINIO_BUCKET', 'eventstan');
    this.publicBaseUrl =
      config.get<string>('MINIO_PUBLIC_URL') ??
      `${useSSL ? 'https' : 'http'}://${endPoint}${port === 443 || port === 80 ? '' : `:${port}`}/${this.bucket}`;

    this.client = new Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    try {
      await this.ensureBucket();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown storage error';
      this.logger.warn(`Object storage is unavailable during startup: ${message}`);
    }
  }

  async uploadImage(file: UploadedFile, folder: string) {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    return this.upload(file, folder || 'images', 10);
  }

  async uploadFile(file: UploadedFile, folder: string) {
    return this.upload(file, folder || 'files', 20);
  }

  private async upload(file: UploadedFile, folder: string, maxSizeMb: number) {
    const maxSize = maxSizeMb * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`File must be ${maxSizeMb}MB or smaller`);
    }

    const safeFolder = this.safeSegment(folder);
    const extension = this.safeExtension(file.originalname, file.mimetype);
    const key = `${safeFolder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;

    try {
      await this.ensureBucket();
      await this.client.putObject(this.bucket, key, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });
    } catch {
      throw new ServiceUnavailableException('File storage is temporarily unavailable');
    }

    return {
      bucket: this.bucket,
      key,
      url: `${this.publicBaseUrl.replace(/\/$/, '')}/${this.encodeKey(key)}`,
      contentType: file.mimetype,
      size: file.size,
    };
  }

  async getImage(key: string): Promise<{ stream: Readable; contentType: string; size?: number }> {
    const safeKey = key.replace(/^\/+/, '');
    if (!safeKey || safeKey.includes('..')) {
      throw new NotFoundException('Image not found');
    }

    try {
      const stat = await this.client.statObject(this.bucket, safeKey);
      const stream = await this.client.getObject(this.bucket, safeKey);
      return {
        stream,
        contentType: stat.metaData?.['content-type'] ?? 'application/octet-stream',
        size: stat.size,
      };
    } catch {
      throw new NotFoundException('Image not found');
    }
  }

  private safeSegment(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9/_-]/g, '-')
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '') || 'images';
  }

  private safeExtension(fileName: string, mimeType: string) {
    const extension = extname(fileName).toLowerCase();
    if (extension) return extension;
    if (mimeType === 'image/png') return '.png';
    if (mimeType === 'image/webp') return '.webp';
    if (mimeType === 'image/gif') return '.gif';
    return '.jpg';
  }

  private encodeKey(key: string) {
    return key.split('/').map((segment) => encodeURIComponent(segment)).join('/');
  }

  private async ensureBucket() {
    if (this.bucketReady) return;
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) await this.client.makeBucket(this.bucket);
    this.bucketReady = true;
  }
}
