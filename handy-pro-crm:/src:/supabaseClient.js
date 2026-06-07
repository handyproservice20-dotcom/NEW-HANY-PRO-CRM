import { createClient } from '@supabase/supabase-js'

// -----------------------------------------------------------
// STEP 1: Replace these two values with your Supabase project
// Go to supabase.com → your project → Settings → API
// -----------------------------------------------------------
const supabaseUrl = 'https://aryhvfihsuppprqxnszf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeWh2Zmloc3VwcHBycXhuc3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3ODM2NjgsImV4cCI6MjA5NjM1OTY2OH0.Zj5I5oFhZ8qQqfPmnWklMkEhny_f73Uq2wBkGAE-Mqw'
// -----------------------------------------------------------

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
