import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iajeupdjwcqecfwuasbd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhamV1cGRqd2NxZWNmd3Vhc2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MjkzODksImV4cCI6MjA1MTEwNTM4OX0.Ialox-e1j92N3vFJ0BetdXtGCizBZhEreCzZ5z2N_nE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
