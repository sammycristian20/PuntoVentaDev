import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SupabaseConfig } from '../config/supabase.config';

@Module({
  controllers: [SalesController],
  providers: [SalesService, SupabaseConfig],
})
export class SalesModule {}