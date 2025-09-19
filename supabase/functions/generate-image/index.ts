import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, size = "1024x1024", quality = "standard", style = "vivid" } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating image with DALL·E 3 for user: ${user.id}`);
    console.log(`Prompt: ${prompt}`);

    // Generate image with OpenAI DALL·E 3
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        size: size,
        quality: quality,
        style: style,
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    const revisedPrompt = data.data[0].revised_prompt || prompt;

    console.log('Generated image URL:', imageUrl);

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    const imageUint8Array = new Uint8Array(imageBuffer);

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.png`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('post-images')
      .upload(fileName, imageUint8Array, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to store image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabaseClient.storage
      .from('post-images')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    console.log('Image stored at:', publicUrl);

    // Save to database
    const { data: savedImage, error: dbError } = await supabaseClient
      .from('generated_images')
      .insert({
        user_id: user.id,
        prompt: revisedPrompt,
        image_url: publicUrl,
        storage_path: fileName,
        generation_provider: 'dalle3'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Still return the image URL even if saving to DB fails
    }

    return new Response(JSON.stringify({ 
      imageUrl: publicUrl,
      revisedPrompt,
      imageId: savedImage?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate image'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});