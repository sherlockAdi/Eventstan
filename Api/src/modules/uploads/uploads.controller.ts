import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UploadsService } from './uploads.service';

interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, example: 'services' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({ description: 'Uploads an image to MinIO and returns its URL.' })
  uploadImage(@UploadedFile() file: UploadedImage | undefined, @Query('folder') folder = 'images', @Req() req: Request) {
    if (!file) throw new BadRequestException('Image file is required');
    return this.uploads.uploadImage(file, folder, this.imageBaseUrl(req));
  }

  @Post('files')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, example: 'agreements' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({ description: 'Uploads a file to MinIO and returns its URL.' })
  uploadFile(@UploadedFile() file: UploadedImage | undefined, @Query('folder') folder = 'files', @Req() req: Request) {
    if (!file) throw new BadRequestException('File is required');
    return this.uploads.uploadFile(file, folder, this.fileBaseUrl(req));
  }

  @Get('images/:folder/:date/:file')
  async getDatedImage(
    @Param('folder') folder: string,
    @Param('date') date: string,
    @Param('file') file: string,
    @Res() res: Response,
  ) {
    return this.streamImage(`${folder}/${date}/${file}`, res);
  }

  @Get('images/*')
  async getImage(@Req() req: Request, @Res() res: Response) {
    const marker = '/uploads/images/';
    const requestPath = req.originalUrl.split('?')[0] ?? '';
    const markerIndex = requestPath.indexOf(marker);
    const encodedKey = markerIndex >= 0 ? requestPath.slice(markerIndex + marker.length) : '';
    const key = decodeURIComponent(encodedKey);
    return this.streamImage(key, res);
  }

  private async streamImage(key: string, res: Response) {
    const image = await this.uploads.getImage(key);

    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (image.size) res.setHeader('Content-Length', String(image.size));

    return image.stream.pipe(res);
  }

  private imageBaseUrl(req: Request) {
    return `${req.protocol}://${req.get('host')}${req.baseUrl}/images`;
  }

  private fileBaseUrl(req: Request) {
    return `${req.protocol}://${req.get('host')}${req.baseUrl}/files`;
  }
}
