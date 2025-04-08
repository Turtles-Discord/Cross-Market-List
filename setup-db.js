require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or service role key. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Test the connection by getting the server time
    const { data, error } = await supabase.rpc('pg_typeof', { v: 1 }).limit(1);
    
    if (error) {
      // Try another connection method
      console.log('Trying alternative connection method...');
      const { error: healthError } = await supabase.from('pg_stat_database').select('*').limit(1);
      
      if (healthError) {
        console.error(`Supabase connection error: ${healthError.message}`);
        console.log('Could not verify connection, but will continue with instructions');
      }
    } else {
      console.log('Connected to Supabase successfully!');
    }
    
    console.log('\nTo set up your database, please run the schema.sql file in the Supabase dashboard SQL editor.');
    console.log(`Schema file location: ${schemaPath}`);
    console.log('\nInstructions:');
    console.log('1. Go to the Supabase dashboard at https://app.supabase.io');
    console.log('2. Select your project');
    console.log('3. Go to the SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Copy and paste the contents of schema.sql');
    console.log('6. Run the query');
    
    // Print the SQL to the console for convenience
    console.log('\nSQL Schema:');
    console.log('----------------------');
    console.log(schemaSql);
    console.log('----------------------');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup function
setupDatabase(); 