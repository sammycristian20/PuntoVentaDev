import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SupabaseConfig } from '../config/supabase.config';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, SupabaseConfig],
})
export class ProductsModule {}