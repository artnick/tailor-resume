import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportRequestDto } from './dto/export.dto';
import { ExportService } from './export.service';

@ApiTags('export')
@Controller('variants')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post(':id/export')
  @ApiOperation({ summary: 'Export variant as PDF' })
  async exportVariant(
    @Param('id') id: string,
    @Body() body: ExportRequestDto,
    @Res() res: Response,
  ) {
    const pdf = await this.exportService.exportVariantPdf(id, body.templateId);
    const filename = `resume-${id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  }
}
