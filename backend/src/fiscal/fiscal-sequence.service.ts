import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';

@Injectable()
export class FiscalSequenceService {
  constructor(private readonly supabaseConfig: SupabaseConfig) {}

  async findAll(businessProfileId: string) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('fiscal_sequences')
      .select('*')
      .eq('business_profile_id', businessProfileId);

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('fiscal_sequences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(sequenceData: any) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('fiscal_sequences')
      .insert([{
        business_profile_id: sequenceData.businessProfileId,
        sequence_type: sequenceData.sequenceType,
        prefix: sequenceData.prefix,
        current_number: sequenceData.currentNumber,
        end_number: sequenceData.endNumber,
        is_active: sequenceData.isActive,
        expiration_date: sequenceData.expirationDate
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, sequenceData: any) {
    const supabase = this.supabaseConfig.createClient();
    const { data, error } = await supabase
      .from('fiscal_sequences')
      .update({
        sequence_type: sequenceData.sequenceType,
        prefix: sequenceData.prefix,
        current_number: sequenceData.currentNumber,
        end_number: sequenceData.endNumber,
        is_active: sequenceData.isActive,
        expiration_date: sequenceData.expirationDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNextSequence(businessProfileId: string, sequenceType: string): Promise<string> {
    const supabase = this.supabaseConfig.createClient();
    
    // Get the active sequence for this type
    const { data: sequence, error } = await supabase
      .from('fiscal_sequences')
      .select('*')
      .eq('business_profile_id', businessProfileId)
      .eq('sequence_type', sequenceType)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    if (!sequence) throw new Error('No active fiscal sequence found');

    // Check if sequence is expired
    if (new Date(sequence.expiration_date) < new Date()) {
      throw new Error('Fiscal sequence has expired');
    }

    // Check if we've reached the end number
    if (sequence.current_number >= sequence.end_number) {
      throw new Error('Fiscal sequence has reached its limit');
    }

    // Generate the next number
    const nextNumber = sequence.current_number + 1;
    const paddedNumber = nextNumber.toString().padStart(8, '0');
    const nextSequence = `${sequence.prefix}${paddedNumber}`;

    // Update the current number
    const { error: updateError } = await supabase
      .from('fiscal_sequences')
      .update({ current_number: nextNumber, updated_at: new Date().toISOString() })
      .eq('id', sequence.id);

    if (updateError) throw updateError;

    return nextSequence;
  }
}