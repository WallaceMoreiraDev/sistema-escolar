import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); 

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltam as chaves do Supabase no arquivo .env!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;