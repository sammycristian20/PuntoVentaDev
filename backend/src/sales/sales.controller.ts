import { Controller, Get, Post, Param, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SalesService } from './sales.service';
import { IsDateString } from 'class-validator';
import { CreateSaleDto } from './dto/sale.dto';

class DateRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  async create(@Body() saleData: CreateSaleDto) {
    try {
      if (!saleData.items || saleData.items.length === 0) {
        throw new HttpException('La venta debe contener al menos un item', HttpStatus.BAD_REQUEST);
      }
      return await this.salesService.create({
        ...saleData,
        items: saleData.items.map(item => ({
          ...item,
          product_id: item.product_id.toString()
        }))
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al procesar la venta: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('summary/range')
  async getSalesSummary(@Query() dateRange: DateRangeDto) {
    try {
      return await this.salesService.getSalesSummary(dateRange.startDate, dateRange.endDate);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}