import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const facebookAccessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function publishToFacebook(postData: any) {
  if (!facebookAccessToken) {
    throw new Error('Facebook access token not configured');
  }

  const { caption, hashtags, imageUrl } = postData;
  
  // Combine caption and hashtags
  const message = `${caption}\n\n${hashtags?.join(' ') || ''}`;
  
  let url = 'https://graph.facebook.com/v18.0/me/feed';
  let body: any = {
    message,
    access_token: facebookAccessToken
  };

  // If there's an image, use photos endpoint instead
  if (imageUrl) {
    url = 'https://graph.facebook.com/v18.0/me/photos';
    body = {
      message,
      url: imageUrl,
      access_token: facebookAccessToken
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Facebook API error: ${result.error?.message || 'Unknown error'}`);
  }

  return result;
}

async function savePostAnalytics(postId: string, platform: string, status: 'success' | 'failed', platformPostId?: string, errorMessage?: string, responseData?: any) {
  const { error } = await supabase
    .from('post_analytics')
    .insert({
      post_id: postId,
      platform,
      platform_post_id: platformPostId,
      published_at: status === 'success' ? new Date().toISOString() : null,
      status,
      error_message: errorMessage,
      response_data: responseData
    });

  if (error) {
    console.error('Error saving analytics:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, platforms } = await req.json();
    
    if (!postId || !platforms || !Array.isArray(platforms)) {
      return new Response(
        JSON.stringify({ error: 'Missing postId or platforms' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the post data
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];

    // Publish to each platform
    for (const platform of platforms) {
      try {
        let platformResult;
        
        switch (platform.toLowerCase()) {
          case 'facebook':
            platformResult = await publishToFacebook(post);
            await savePostAnalytics(postId, 'facebook', 'success', platformResult.id, undefined, platformResult);
            results.push({ platform: 'facebook', status: 'success', data: platformResult });
            break;
            
          default:
            await savePostAnalytics(postId, platform, 'failed', undefined, `Platform ${platform} not supported yet`);
            results.push({ platform, status: 'failed', error: `Platform ${platform} not supported yet` });
        }
      } catch (error) {
        console.error(`Error publishing to ${platform}:`, error);
        await savePostAnalytics(postId, platform, 'failed', undefined, error.message);
        results.push({ platform, status: 'failed', error: error.message });
      }
    }

    // Update post status based on results
    const hasSuccess = results.some(r => r.status === 'success');
    const allFailed = results.every(r => r.status === 'failed');
    
    let newStatus = 'published';
    if (allFailed) {
      newStatus = 'failed';
    }

    await supabase
      .from('posts')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    return new Response(
      JSON.stringify({ 
        success: hasSuccess,
        results,
        postStatus: newStatus
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in publish-post function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});