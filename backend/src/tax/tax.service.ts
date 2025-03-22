import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';
import { CreateTaxConfigurationDto, UpdateTaxConfigurationDto } from './dto/tax-configuration.dto';

@Injectable()
export class TaxService {
  constructor(private readonly supabaseConfig: SupabaseConfig) {}

  async findAll(businessProfileId: string) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('tax_configurations')
      .select('*')
      .eq('business_profile_id', businessProfileId);

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('tax_configurations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(taxConfigData: CreateTaxConfigurationDto) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('tax_configurations')
      .insert([{
        business_profile_id: taxConfigData.businessProfileId,
        tax_type: taxConfigData.taxType,
        rate: taxConfigData.rate,
        is_active: taxConfigData.isActive
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, taxConfigData: UpdateTaxConfigurationDto) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('tax_configurations')
      .update({
        tax_type: taxConfigData.taxType,
        rate: taxConfigData.rate,
        is_active: taxConfigData.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseConfig.createClient();
    const { error } = await supabase
      .from('tax_configurations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Tax configuration deleted successfully' };
  }
}