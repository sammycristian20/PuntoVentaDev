import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseConfig } from './config/supabase.config';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { TaxModule } from './tax/tax.module';
import { FiscalModule } from './fiscal/fiscal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductsModule,
    SalesModule,
    TaxModule,
    FiscalModule,
  ],
  providers: [SupabaseConfig],
  exports: [SupabaseConfig],
})
export class AppModule {}