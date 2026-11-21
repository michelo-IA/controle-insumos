import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kpoozprkgwejzzxztjyv.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwb296cHJrZ3dlanp6eHp0anl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzY0MTcsImV4cCI6MjEwNDY1MjQxN30.69_ON4i9i8q6kLqDvtQhphdD4yMqVzft4pRIr86hBZ4';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
