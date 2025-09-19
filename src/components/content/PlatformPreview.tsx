import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, Repeat2, ThumbsUp, Send } from 'lucide-react';

interface PlatformPreviewProps {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  caption: string;
  hashtags: string;
  imageUrl?: string;
  userName?: string;
}

const PlatformPreview: React.FC<PlatformPreviewProps> = ({ 
  platform, 
  caption, 
  hashtags, 
  imageUrl, 
  userName = "Your Business" 
}) => {
  const formatCaption = () => {
    const fullText = caption + (hashtags ? `\n\n${hashtags}` : '');
    return fullText;
  };

  const renderImage = () => {
    if (!imageUrl) return null;
    
    return (
      <div className="bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt="Post content"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4Ni43IDEzNi43IDE2Ni43IDEzNi43IDE1MyAxNTBMMTI1IDEyMkMxMTEuNyAxMDguNyA5MS43IDEwOC43IDc4IDEyMkM2NC4zIDEzNS43IDY0LjMgMTU1LjcgNzggMTY5TDEwNiAxOTdMMTM0IDIyNUMxNDcuMyAyMzguMyAxNjcuMyAyMzguMyAxODEgMjI1QzE5NC43IDIxMS4zIDE5NC43IDE5MS4zIDE4MSAxNzhMMTUzIDE1MEgxNTNMMjAwIDE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
          }}
        />
      </div>
    );
  };

  const renderFacebookPreview = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground">Facebook Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="flex items-center p-3 space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-500 text-white">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-gray-500">2 min • 🌍</p>
            </div>
          </div>
          <div className="px-3 pb-3">
            <p className="text-sm whitespace-pre-wrap">{formatCaption()}</p>
          </div>
          {imageUrl && (
            <div className="aspect-square">
              {renderImage()}
            </div>
          )}
          <div className="flex justify-between items-center p-3 border-t">
            <div className="flex space-x-6">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">Like</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Comment</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                <Share className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderInstagramPreview = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground">Instagram Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="flex items-center p-3 space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-sm">{userName.toLowerCase().replace(/\s+/g, '')}</p>
          </div>
          <div className="aspect-square">
            {imageUrl ? renderImage() : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500">Image Preview</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center p-3">
            <div className="flex space-x-4">
              <Heart className="h-6 w-6" />
              <MessageCircle className="h-6 w-6" />
              <Send className="h-6 w-6" />
            </div>
          </div>
          <div className="px-3 pb-3">
            <p className="text-sm">
              <span className="font-semibold">{userName.toLowerCase().replace(/\s+/g, '')} </span>
              {formatCaption()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLinkedInPreview = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground">LinkedIn Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="flex items-center p-4 space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-600 text-white">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-gray-500">2m • Edited</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm whitespace-pre-wrap">{formatCaption()}</p>
          </div>
          {imageUrl && (
            <div className="aspect-video">
              {renderImage()}
            </div>
          )}
          <div className="flex justify-between items-center p-4 border-t">
            <div className="flex space-x-6">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">Like</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Comment</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                <Repeat2 className="h-4 w-4" />
                <span className="text-sm">Repost</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                <Send className="h-4 w-4" />
                <span className="text-sm">Send</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTwitterPreview = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground">Twitter Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="flex p-3 space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-black text-white">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                <p className="font-bold text-sm">{userName}</p>
                <p className="text-gray-500 text-sm">@{userName.toLowerCase().replace(/\s+/g, '')}</p>
                <p className="text-gray-500 text-sm">• 2m</p>
              </div>
              <p className="text-sm mt-1 whitespace-pre-wrap">{formatCaption()}</p>
              {imageUrl && (
                <div className="aspect-video mt-3 rounded-xl overflow-hidden">
                  {renderImage()}
                </div>
              )}
              <div className="flex justify-between items-center mt-3 max-w-md">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">Reply</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                  <Repeat2 className="h-4 w-4" />
                  <span className="text-sm">Retweet</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Like</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                  <Share className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  switch (platform) {
    case 'facebook':
      return renderFacebookPreview();
    case 'instagram':
      return renderInstagramPreview();
    case 'linkedin':
      return renderLinkedInPreview();
    case 'twitter':
      return renderTwitterPreview();
    default:
      return null;
  }
};

export default PlatformPreview;