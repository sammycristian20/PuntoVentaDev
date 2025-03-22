import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';

@Injectable()
export class SalesService {
  constructor(private readonly supabaseConfig: SupabaseConfig) {}

  async findAll() {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('sales')
      .select('*, items:sales_items(*, products(*))');
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('sales')
      .select('*, items:sales_items(*, products(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(saleData: { 
    items: Array<{ 
      product_id: string; 
      quantity: number; 
      price: number; 
    }>;
    [key: string]: any;
  }) {
    const supabase = this.supabaseConfig.createClient();
    const { items, ...saleInfo } = saleData;

    // Verificar que todos los productos existan y tengan stock suficiente
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        throw new Error(`Producto con ID ${item.product_id} no encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto ${item.product_id}`);
      }
    }

    try {
      // Start a transaction by inserting the sale first
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{ ...saleInfo, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Then insert all sale items
      const saleItems = items.map((item) => ({
        ...item,
        sale_id: sale.id,
      }));

      const { error: itemsError } = await supabase
        .from('sales_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of items) {
        const { error: updateError } = await supabase
          .rpc('update_product_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity
          });

        if (updateError) throw updateError;
      }

      return this.findOne(sale.id);
    } catch (error) {
      throw new Error(`Error al procesar la venta: ${error.message}`);
    }
  }

  async getSalesSummary(startDate: string, endDate: string) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('sales')
      .select('*, items:sales_items(quantity, price, products(name))')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;
    return data;
  }
}