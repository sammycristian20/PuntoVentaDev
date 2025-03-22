import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseConfig {
  private supabaseUrl = process.env.SUPABASE_URL;
  private supabaseKey = process.env.SUPABASE_KEY;

  createClient() {
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    return createClient(this.supabaseUrl, this.supabaseKey);
  }
}