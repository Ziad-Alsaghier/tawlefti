import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, payload } = await req.json()

    if (!user_id || !payload) {
      throw new Error('Missing user_id or payload in request body');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user_id)
      .single()

    if (subscriptionError || !subscriptionData) {
      console.warn(`Subscription not found for user ${user_id}. Skipping notification.`);
      return new Response(JSON.stringify({ success: true, message: 'No subscription found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys are not set in Supabase Edge Function secrets.')
    }

    webpush.setVapidDetails(
      'mailto:info@tawleefati.com', // You can change this to your email
      vapidPublicKey,
      vapidPrivateKey
    )

    await webpush.sendNotification(
      subscriptionData.subscription,
      JSON.stringify(payload)
    )

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error sending push notification:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})