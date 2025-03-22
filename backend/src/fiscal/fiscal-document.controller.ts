import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { FiscalDocumentService } from './fiscal-document.service';

@Controller('fiscal-document')
export class FiscalDocumentController {
  constructor(private readonly fiscalDocumentService: FiscalDocumentService) {}

  @Get()
  async findAll(@Query('businessProfileId') businessProfileId: string) {
    return this.fiscalDocumentService.findAll(businessProfileId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.fiscalDocumentService.findOne(id);
  }

  @Post('from-sale/:saleId/:businessProfileId')
  async createFromSale(
    @Param('saleId') saleId: string,
    @Param('businessProfileId') businessProfileId: string,
  ) {
    return this.fiscalDocumentService.createFromSale(saleId, businessProfileId);
  }
}