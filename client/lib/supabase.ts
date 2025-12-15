import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ehpesygzahrwtfyyiwcy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocGVzeWd6YWhyd3RmeXlpd2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjU5NDgsImV4cCI6MjA4MTM0MTk0OH0.mE_AP5jY_CPySE6D21ZppcE39ZRx2SfxqLlysa21smY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
