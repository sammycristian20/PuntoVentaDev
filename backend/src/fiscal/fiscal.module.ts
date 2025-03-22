import { Module } from '@nestjs/common';
import { FiscalSequenceController } from './fiscal-sequence.controller';
import { FiscalSequenceService } from './fiscal-sequence.service';
import { FiscalDocumentController } from './fiscal-document.controller';
import { FiscalDocumentService } from './fiscal-document.service';
import { TaxModule } from '../tax/tax.module';

@Module({
  imports: [TaxModule],
  controllers: [FiscalSequenceController, FiscalDocumentController],
  providers: [FiscalSequenceService, FiscalDocumentService],
  exports: [FiscalSequenceService, FiscalDocumentService]
})
export class FiscalModule {}