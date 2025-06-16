import { Module } from '@nestjs/common';
import { BlogModule } from '../blog/blog.module';
import { MTImportService } from './services/mt-import.service';

@Module({
  imports: [BlogModule],
  providers: [MTImportService],
  exports: [MTImportService],
})
export class MTImportModule {}