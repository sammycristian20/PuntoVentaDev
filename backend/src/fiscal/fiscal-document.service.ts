import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';
import { FiscalSequenceService } from './fiscal-sequence.service';
import { TaxService } from '../tax/tax.service';

@Injectable()
export class FiscalDocumentService {
  constructor(
    private readonly supabaseConfig: SupabaseConfig,
    private readonly fiscalSequenceService: FiscalSequenceService,
    private readonly taxService: TaxService
  ) {}

  async findAll(businessProfileId: string) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('fiscal_documents')
      .select('*, sale(*)')
      .eq('business_profile_id', businessProfileId);

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('fiscal_documents')
      .select('*, sale(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createFromSale(saleId: string, businessProfileId: string) {
    const supabase = this.supabaseConfig.createClient();
    
    // Get sale details
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*, sale_items(*, product(*))')
      .eq('id', saleId)
      .single();

    if (saleError) throw saleError;

    // Get active tax configuration
    const taxConfigs = await this.taxService.findAll(businessProfileId);
    const activeTaxConfig = taxConfigs.find(config => config.is_active);

    if (!activeTaxConfig) {
      throw new Error('No active tax configuration found');
    }

    // Calculate tax amounts
    const netAmount = sale.total_amount / (1 + activeTaxConfig.rate / 100);
    const taxAmount = sale.total_amount - netAmount;

    // Get next fiscal sequence
    const documentNumber = await this.fiscalSequenceService.getNextSequence(
      businessProfileId,
      'FACTURA'
    );

    // Create fiscal document
    const { data: fiscalDocument, error } = await supabase
      .from('fiscal_documents')
      .insert([{
        sale_id: saleId,
        document_number: documentNumber,
        document_type: 'FACTURA',
        tax_amount: taxAmount,
        net_amount: netAmount,
        total_amount: sale.total_amount
      }])
      .select()
      .single();

    if (error) throw error;
    return fiscalDocument;
  }
}