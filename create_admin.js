const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jcytqknxxcqkfraonhwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeXRxa254eGNxa2ZyYW9uaHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzUzNzgsImV4cCI6MjA4NDE1MTM3OH0.pDetfK3VpAgKp4mva_OfWzmdYZQs_I9Ajl7Ud1lwiNk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUpUser() {
    const { data, error } = await supabase.auth.signUp({
        email: 'admin@lavibefit.com.br',
        password: '1349123'
    });

    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created or already exists:', data);
    }
}

signUpUser();
