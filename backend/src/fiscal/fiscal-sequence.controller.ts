import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { FiscalSequenceService } from './fiscal-sequence.service';
import { CreateFiscalSequenceDto, UpdateFiscalSequenceDto } from './dto/fiscal-sequence.dto';

@Controller('fiscal-sequence')
export class FiscalSequenceController {
  constructor(private readonly fiscalSequenceService: FiscalSequenceService) {}

  @Get()
  async findAll(@Query('businessProfileId') businessProfileId: string) {
    return this.fiscalSequenceService.findAll(businessProfileId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.fiscalSequenceService.findOne(id);
  }

  @Post()
  async create(@Body() sequenceData: CreateFiscalSequenceDto) {
    return this.fiscalSequenceService.create(sequenceData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() sequenceData: UpdateFiscalSequenceDto,
  ) {
    return this.fiscalSequenceService.update(id, sequenceData);
  }

  @Get('next/:businessProfileId/:sequenceType')
  async getNextSequence(
    @Param('businessProfileId') businessProfileId: string,
    @Param('sequenceType') sequenceType: string,
  ) {
    return this.fiscalSequenceService.getNextSequence(businessProfileId, sequenceType);
  }
}