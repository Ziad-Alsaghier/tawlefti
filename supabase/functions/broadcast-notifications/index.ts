import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendNotificationsInBatches(subscriptions: any[], payload: any, vapidDetails: any) {
  webpush.setVapidDetails(
    vapidDetails.subject,
    vapidDetails.publicKey,
    vapidDetails.privateKey
  );

  const promises = subscriptions.map(s => 
    webpush.sendNotification(s.subscription, JSON.stringify(payload))
      .catch(err => {
        console.error(`Failed to send to endpoint: ${s.subscription.endpoint}. Error: ${err.message}`);
      })
  );

  await Promise.all(promises);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { payload } = await req.json()

    if (!payload || !payload.title || !payload.body) {
      throw new Error('Missing payload with title and body in request body');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')

    if (subscriptionError) throw subscriptionError;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No subscriptions found.', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys are not set in Supabase Edge Function secrets.')
    }

    const vapidDetails = {
      subject: 'mailto:info@tawleefati.com',
      publicKey: vapidPublicKey,
      privateKey: vapidPrivateKey,
    };

    await sendNotificationsInBatches(subscriptions, payload, vapidDetails);

    return new Response(JSON.stringify({ success: true, count: subscriptions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error broadcasting push notifications:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})