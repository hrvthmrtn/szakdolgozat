
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://xtsafbyrljaemkmpyrgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0c2FmYnlybGphZW1rbXB5cmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5MDM5NDcsImV4cCI6MjA0NDQ3OTk0N30.Pwaf4mT-S9lt84j1_-vwWuVSOUC5m6bgSBR0eUx0Dn4';

export const supabase = createClient(supabaseUrl, supabaseKey);
