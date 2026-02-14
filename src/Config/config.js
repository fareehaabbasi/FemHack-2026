import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://ijebcevpyjuqzlrthsve.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZWJjZXZweWp1cXpscnRoc3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTgwNjUsImV4cCI6MjA4NjYzNDA2NX0.e-K-zxObFvjErfhq7X6B3m3w00aSwc4l10ju9wauUIs";

const client = createClient(supabaseUrl, supabaseKey);
console.log(createClient);
console.log(client);

export default client;