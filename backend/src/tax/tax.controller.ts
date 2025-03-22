import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TaxService } from './tax.service';
import { CreateTaxConfigurationDto, UpdateTaxConfigurationDto } from './dto/tax-configuration.dto';

@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get()
  async findAll(@Query('businessProfileId') businessProfileId: string) {
    return this.taxService.findAll(businessProfileId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.taxService.findOne(id);
  }

  @Post()
  async create(@Body() taxConfigData: CreateTaxConfigurationDto) {
    return this.taxService.create(taxConfigData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() taxConfigData: UpdateTaxConfigurationDto,
  ) {
    return this.taxService.update(id, taxConfigData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.taxService.remove(id);
  }
}