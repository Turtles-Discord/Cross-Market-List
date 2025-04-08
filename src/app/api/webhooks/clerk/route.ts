import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET env var');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;
  console.log(`Webhook with type ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    // Safely access email_addresses with null checking
    const id = evt.data.id as string;
    let userEmail = '';
    
    // Check if email_addresses exists and is an array
    if (evt.data.email_addresses && 
        Array.isArray(evt.data.email_addresses) && 
        evt.data.email_addresses.length > 0 &&
        evt.data.email_addresses[0].email_address) {
      userEmail = evt.data.email_addresses[0].email_address;
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (!checkError) {
      // Update user if exists
      if (eventType === 'user.updated') {
        await supabase
          .from('users')
          .update({ email: userEmail })
          .eq('id', id);
      }
    } else {
      // Create user if not exists
      await supabase
        .from('users')
        .insert({
          id,
          email: userEmail,
          plan_type: 'free',
          listings_count: 0
        });
    }
  }

  return NextResponse.json({ success: true });
} 