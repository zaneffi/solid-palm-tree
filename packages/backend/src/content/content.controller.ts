import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Sse,
  Param,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ContentService, FormFields } from './content.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

interface SseMessage {
  data: string;
  id?: string;
  type?: string;
  retry?: number;
}

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'productImages', maxCount: 5 },
        { name: 'technicalDocs', maxCount: 5 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(
              null,
              file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
            );
          },
        }),
      },
    ),
  )
  async uploadFiles(
    @UploadedFiles()
    files: {
      productImages: Express.Multer.File[];
      technicalDocs: Express.Multer.File[];
    },
    @Body() formData: Omit<FormFields, 'productImages' | 'technicalDocs'>,
  ) {
    const formFields: FormFields = {
      ...formData,
      productImages: files.productImages,
      technicalDocs: files.technicalDocs,
      selectedLanguages: Array.isArray(formData.selectedLanguages)
        ? formData.selectedLanguages
        : JSON.parse(formData.selectedLanguages as string),
    };

    // Store the form fields for later use with SSE
    this.contentService.storeFormFields(formFields);

    return { message: 'Files uploaded successfully', formFields };
  }

  @Sse('generate/:id')
  generateContent(@Param('id') id: string): Observable<SseMessage> {
    const formFields = this.contentService.getFormFields();
    if (!formFields) {
      throw new Error('No form fields found. Please upload files first.');
    }

    const generator = this.contentService.generateContent(formFields);

    return from(this.iterateGenerator(generator)).pipe(
      map((data) => ({
        data: JSON.stringify(data),
        id,
      })),
    );
  }

  private async *iterateGenerator(generator: AsyncGenerator) {
    try {
      for await (const value of generator) {
        yield value;
      }
      // Send completion message
      yield { type: 'complete', isComplete: true };
    } catch (error) {
      yield { type: 'error', message: error.message };
    }
  }
}
