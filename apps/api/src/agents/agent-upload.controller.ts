import { Controller, HttpStatus, Param, Post, UploadedFile, UseInterceptors, ParseFilePipeBuilder } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import multer from 'multer'
import { AgentUploadService } from './agent-upload.service'

@Controller('agents/:id')
export class AgentUploadController {
  constructor(private readonly uploadService: AgentUploadService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage()
    })
  )
  uploadFinancialReport(
    @Param('id') agentId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /pdf$/i })
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE })
    )
    file: Express.Multer.File
  ) {
    return this.uploadService.processFinancialReport(agentId, file)
  }
}
