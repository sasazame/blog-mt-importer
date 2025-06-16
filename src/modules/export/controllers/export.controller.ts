import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { MarkdownExportService, ExportOptions, ExportFilter } from '../services/markdown-export.service';

@Controller('export')
export class ExportController {
  constructor(private readonly markdownExportService: MarkdownExportService) {}

  @Get('markdown/post/:id')
  async exportSinglePost(
    @Param('id', ParseIntPipe) id: number,
    @Query('include_front_matter') includeFrontMatter: string = 'true',
    @Query('include_extended_body') includeExtendedBody: string = 'true',
    @Res() res: Response,
  ) {
    try {
      const options = {
        includeFrontMatter: includeFrontMatter !== 'false',
        includeExtendedBody: includeExtendedBody !== 'false',
      };

      const markdown = await this.markdownExportService.exportSinglePost(id, options);
      
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="post-${id}.md"`);
      res.send(markdown);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('markdown/all')
  async exportAllPosts(
    @Query('format') format: 'individual' | 'batch' = 'individual',
    @Query('include_front_matter') includeFrontMatter: string = 'true',
    @Query('include_extended_body') includeExtendedBody: string = 'true',
    @Query('output_path') outputPath: string = './exports',
    @Res() res: Response,
  ) {
    try {
      const options: ExportOptions = {
        format,
        includeFrontMatter: includeFrontMatter !== 'false',
        includeExtendedBody: includeExtendedBody !== 'false',
        outputPath,
      };

      await this.markdownExportService.exportAllPosts(options);
      
      res.json({
        success: true,
        message: `All posts exported in ${format} format to ${outputPath}`,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('markdown/category/:category')
  async exportByCategory(
    @Param('category') category: string,
    @Query('format') format: 'individual' | 'batch' = 'individual',
    @Query('include_front_matter') includeFrontMatter: string = 'true',
    @Query('include_extended_body') includeExtendedBody: string = 'true',
    @Query('output_path') outputPath: string = './exports',
    @Res() res: Response,
  ) {
    try {
      const options: ExportOptions = {
        format,
        includeFrontMatter: includeFrontMatter !== 'false',
        includeExtendedBody: includeExtendedBody !== 'false',
        outputPath,
      };

      await this.markdownExportService.exportByCategory(category, options);
      
      res.json({
        success: true,
        message: `Posts in category '${category}' exported in ${format} format to ${outputPath}`,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('markdown/date-range')
  async exportByDateRange(
    @Query('start_date') startDateStr: string,
    @Query('end_date') endDateStr: string,
    @Query('format') format: 'individual' | 'batch' = 'individual',
    @Query('include_front_matter') includeFrontMatter: string = 'true',
    @Query('include_extended_body') includeExtendedBody: string = 'true',
    @Query('output_path') outputPath: string = './exports',
    @Res() res: Response,
  ) {
    try {
      if (!startDateStr || !endDateStr) {
        throw new BadRequestException('start_date and end_date are required');
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      const options: ExportOptions = {
        format,
        includeFrontMatter: includeFrontMatter !== 'false',
        includeExtendedBody: includeExtendedBody !== 'false',
        outputPath,
      };

      await this.markdownExportService.exportByDateRange(startDate, endDate, options);
      
      res.json({
        success: true,
        message: `Posts from ${startDateStr} to ${endDateStr} exported in ${format} format to ${outputPath}`,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('markdown/filter')
  async exportWithFilter(
    @Query('category') category: string = '',
    @Query('start_date') startDateStr: string = '',
    @Query('end_date') endDateStr: string = '',
    @Query('status') status: 'Publish' | 'Draft' = 'Publish',
    @Query('format') format: 'individual' | 'batch' = 'individual',
    @Query('include_front_matter') includeFrontMatter: string = 'true',
    @Query('include_extended_body') includeExtendedBody: string = 'true',
    @Query('output_path') outputPath: string = './exports',
    @Res() res: Response,
  ) {
    try {
      const filter: ExportFilter = {};

      if (category && category !== '') filter.category = category;
      if (status && status !== 'Publish') filter.status = status;

      if (startDateStr && startDateStr !== '' && endDateStr && endDateStr !== '') {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
        }

        filter.startDate = startDate;
        filter.endDate = endDate;
      }

      const options: ExportOptions = {
        format,
        includeFrontMatter: includeFrontMatter !== 'false',
        includeExtendedBody: includeExtendedBody !== 'false',
        outputPath,
      };

      await this.markdownExportService.exportWithFilter(filter, options);
      
      res.json({
        success: true,
        message: `Filtered posts exported in ${format} format to ${outputPath}`,
        filter,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}