// Import the necessary modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

// Environment variables (set in Supabase dashboard)
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main function to handle requests
async function handler(req: Request) {
  // Set NODE_ENV to production
  const nodeEnv = 'production';
  
  // Log the environment for debugging
  console.log(`Environment: ${nodeEnv}`);
  
  try {
    // Example: Fetch posts from the database
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (error) {
      throw error;
    }
    
    // Return the data as JSON
    return new Response(
      JSON.stringify({
        success: true,
        environment: nodeEnv,
        data: data
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({
        success: false,
        environment: nodeEnv,
        error: error.message
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
}

// Serve the function
serve(handler);