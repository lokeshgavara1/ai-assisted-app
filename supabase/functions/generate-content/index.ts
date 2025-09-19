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
    const { prompt, contentType, platform } = await req.json();

    if (!prompt || !contentType) {
      return new Response(
        JSON.stringify({ error: 'Prompt and content type are required' }),
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

    // Generate system prompts based on content type
    let systemPrompt = '';
    let userPrompt = prompt;

    switch (contentType) {
      case 'caption':
        systemPrompt = `You are a social media expert. Generate engaging, creative captions for social media posts. Make them conversational, authentic, and optimized for ${platform || 'social media'}. Include relevant emojis when appropriate. Keep it concise but impactful.`;
        break;
      case 'hashtags':
        systemPrompt = `You are a hashtag specialist. Generate 10-15 relevant, trending hashtags for social media posts. Mix popular hashtags with niche ones. Focus on ${platform || 'general social media'} best practices. Return only hashtags separated by spaces.`;
        break;
      case 'post':
        systemPrompt = `You are a content creator. Generate a complete social media post including caption and suggested hashtags optimized for ${platform || 'social media'}. Make it engaging, authentic, and platform-appropriate.`;
        break;
      default:
        systemPrompt = 'You are a helpful social media content assistant.';
    }

    console.log(`Generating ${contentType} for platform: ${platform}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: contentType === 'hashtags' ? 200 : 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Generated content:', generatedText);

    // Save to database
    const { data: savedContent, error: dbError } = await supabaseClient
      .from('generated_content')
      .insert({
        user_id: user.id,
        content_type: contentType,
        prompt,
        generated_text: generatedText,
        platform: platform || null
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Still return the generated content even if saving fails
    }

    return new Response(JSON.stringify({ 
      generatedText,
      contentId: savedContent?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate content'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});