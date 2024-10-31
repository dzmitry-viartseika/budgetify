import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { request } from 'express';
import { FilePrefixEnum } from '../types/enums/file-prefix.enum';
import { getPresignedUrl } from './utils/getPresignedUrl';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private s3: S3Client;
  private bucketName: string = process.env.AWS_BUCKET_NAME;

  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(file: Express.Multer.File, prefix: FilePrefixEnum): Promise<string> {
    const fileName = `${prefix}/${uuid()}-${file.originalname}`;
    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3.send(new PutObjectCommand(uploadParams));
    this.logger.verbose(`File has been successfully uploaded with filename: ${fileName}`);
    return fileName;
  }

  public async deleteFile(avatarUrl: string): Promise<void> {
    const cleanedUrl = avatarUrl.split('?')[0];

    const finalFileName = cleanedUrl.split('/').pop();

    const params = {
      Bucket: this.bucketName,
      Key: finalFileName,
    };
    try {
      const command = new DeleteObjectCommand(params);
      await this.s3.send(command);
      this.logger.verbose(`Old avatar deleted from S3: ${avatarUrl}`);
    } catch (error) {
      this.logger.error(`Failed to delete old avatar from S3: ${error.message}`);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Failed to delete old avatar from S3: ${error.message}`,
          path: request.url,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async deleteFileByName(fileName: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await this.s3.send(command);
      this.logger.verbose(`File deleted from S3: ${fileName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error.message}`);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Failed to delete file from S3: ${error.message}`,
          path: request.url,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generateDownloadLink(fileName: string): Promise<string> {
    try {
      const url = await getPresignedUrl(fileName);
      this.logger.verbose(`Generated pre-signed URL for file: ${fileName}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate pre-signed URL: ${error.message}`);
      throw new HttpException('Failed to generate download link', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
