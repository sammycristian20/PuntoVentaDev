import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly supabaseConfig: SupabaseConfig) {}

  async findAll() {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return data;
  }

  async create(productData: CreateProductDto) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (error) throw error;
    return data[0];
  }

  async update(id: string, productData: UpdateProductDto) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return data[0];
  }


  async remove(id: string) {
    const supabase = this.supabaseConfig.createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return { id };
  }
}