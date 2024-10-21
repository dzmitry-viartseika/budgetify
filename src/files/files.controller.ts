import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { request } from 'express';

@ApiTags('files')
@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly filesService: FilesService) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'File uploaded successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'File is not uploaded due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The file have been successfully uploaded.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions to upload files.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid input data provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      this.logger.verbose(`Try to upload file with name: ${file}`);
      const fileName = await this.filesService.uploadFile(file);
      this.logger.verbose(`The file uploaded with name: ${fileName}`);
      return { fileName, message: 'File uploaded successfully' };
    } catch (error) {
      this.logger.error(`Failed to upload file ${file} and ${error}`);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to upload file',
          path: request.url,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'File deleted successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'File is not deleted due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The file have been successfully deleted.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions to delete files.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid input data provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @UseGuards(AccessTokenGuard)
  @Delete('delete/:fileName')
  async deleteFileByName(@Param('fileName') fileName: string) {
    try {
      this.logger.verbose(`Try to delete file with name: ${fileName}`);
      await this.filesService.deleteFileByName(fileName);
      return { message: `File ${fileName} deleted successfully` };
    } catch (error) {
      this.logger.error(`Failed to delete file with name: ${fileName}`);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Failed to delete file ${error}`,
          path: request.url,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
