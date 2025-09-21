import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const facebookAccessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function publishToFacebook(caption: string, hashtags: string[], imageUrl?: string) {
  if (!facebookAccessToken) {
    throw new Error('Facebook access token not configured');
  }

  const message = `${caption}\n\n${hashtags.join(' ')}`;
  
  try {
    let response;
    
    if (imageUrl) {
      // Post with photo
      const formData = new FormData();
      formData.append('message', message);
      formData.append('url', imageUrl);
      formData.append('access_token', facebookAccessToken);
      
      response = await fetch('https://graph.facebook.com/v18.0/me/photos', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Text post only
      const params = new URLSearchParams({
        message,
        access_token: facebookAccessToken,
      });
      
      response = await fetch('https://graph.facebook.com/v18.0/me/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });
    }
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Facebook API error:', errorData);
      throw new Error(`Facebook API error: ${response.status} - ${errorData}`);
    }
    
    const result = await response.json();
    console.log('Facebook post successful:', result);
    
    return {
      success: true,
      platformPostId: result.id || result.post_id,
      data: result,
    };
  } catch (error) {
    console.error('Error posting to Facebook:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { postId, platforms } = await req.json();

    // Get the post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (postError || !post) {
      throw new Error('Post not found');
    }

    const results = [];

    for (const platform of platforms) {
      try {
        let result;
        
        switch (platform.toLowerCase()) {
          case 'facebook':
            result = await publishToFacebook(
              post.caption,
              post.hashtags || [],
              post.image_url
            );
            break;
          default:
            throw new Error(`Platform ${platform} not supported yet`);
        }

        // Store analytics
        await supabase
          .from('post_analytics')
          .insert({
            post_id: postId,
            platform: platform,
            platform_post_id: result.platformPostId,
            published_at: new Date().toISOString(),
            status: 'success',
            response_data: result.data,
          });

        results.push({
          platform,
          success: true,
          platformPostId: result.platformPostId,
        });

      } catch (error) {
        console.error(`Error posting to ${platform}:`, error);
        
        // Store failed analytics
        await supabase
          .from('post_analytics')
          .insert({
            post_id: postId,
            platform: platform,
            published_at: new Date().toISOString(),
            status: 'failed',
            error_message: error.message,
          });

        results.push({
          platform,
          success: false,
          error: error.message,
        });
      }
    }

    // Update post status
    const allSuccessful = results.every(r => r.success);
    const anySuccessful = results.some(r => r.success);
    
    await supabase
      .from('posts')
      .update({
        status: allSuccessful ? 'published' : anySuccessful ? 'published' : 'failed'
      })
      .eq('id', postId);

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in publish-post function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});