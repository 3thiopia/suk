import { SocialPlatformId, StorefrontSocialLink } from '../types';

export interface SocialPlatformInfo {
  id: SocialPlatformId;
  name: string;
  domain: string;
  placeholder: string;
  exampleUrl: string;
  brandColor: string;
  brandBgColor: string;
  category: 'social' | 'messaging' | 'video' | 'developer' | 'web' | 'other';
  validate: (url: string) => { isValid: boolean; error?: string; formattedUrl: string };
}

export function formatUrlWithProtocol(input: string, isEmail = false): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (isEmail) {
    if (trimmed.startsWith('mailto:')) return trimmed;
    return `mailto:${trimmed}`;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export const SOCIAL_PLATFORMS: SocialPlatformInfo[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    domain: 'facebook.com',
    placeholder: 'https://facebook.com/username',
    exampleUrl: 'https://facebook.com/myresellerbrand',
    brandColor: '#1877F2',
    brandBgColor: '#E7F1FF',
    category: 'social',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/[a-zA-Z0-9._%-]+(\/)?$/i.test(formatted) || formatted.includes('facebook.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Facebook URL (e.g. facebook.com/username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    domain: 'instagram.com',
    placeholder: 'https://instagram.com/username',
    exampleUrl: 'https://instagram.com/myresellerbrand',
    brandColor: '#E4405F',
    brandBgColor: '#FDF0F2',
    category: 'social',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('instagram.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Instagram profile URL (e.g. instagram.com/username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    domain: 'x.com',
    placeholder: 'https://x.com/username',
    exampleUrl: 'https://x.com/myresellerbrand',
    brandColor: '#000000',
    brandBgColor: '#F3F4F6',
    category: 'social',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/?$/i.test(formatted) || formatted.includes('x.com/') || formatted.includes('twitter.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid X/Twitter profile URL (e.g. x.com/username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    domain: 'tiktok.com',
    placeholder: 'https://www.tiktok.com/@username',
    exampleUrl: 'https://www.tiktok.com/@myresellerbrand',
    brandColor: '#000000',
    brandBgColor: '#F0FDF4',
    category: 'video',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?tiktok\.com\/@[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('tiktok.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid TikTok profile URL (e.g. tiktok.com/@username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'telegram',
    name: 'Telegram',
    domain: 't.me',
    placeholder: 'https://t.me/username',
    exampleUrl: 'https://t.me/myresellerbrand',
    brandColor: '#26A5E4',
    brandBgColor: '#E6F6FF',
    category: 'messaging',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\/[a-zA-Z0-9_]+\/?$/i.test(formatted) || formatted.includes('t.me/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Telegram link (e.g. t.me/username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'youtube',
    name: 'YouTube',
    domain: 'youtube.com',
    placeholder: 'https://youtube.com/@channel',
    exampleUrl: 'https://youtube.com/@myresellerbrand',
    brandColor: '#FF0000',
    brandBgColor: '#FFE6E6',
    category: 'video',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(formatted) || formatted.includes('youtube.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid YouTube channel or handle URL',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    placeholder: 'https://linkedin.com/in/username',
    exampleUrl: 'https://linkedin.com/in/myresellerbrand',
    brandColor: '#0A66C2',
    brandBgColor: '#E8F3FF',
    category: 'social',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company|school)\/[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('linkedin.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid LinkedIn URL (e.g. linkedin.com/in/name)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    domain: 'snapchat.com',
    placeholder: 'https://snapchat.com/add/username',
    exampleUrl: 'https://snapchat.com/add/myresellerbrand',
    brandColor: '#FFFC00',
    brandBgColor: '#FFFEE6',
    category: 'social',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?snapchat\.com\/(add\/)?[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('snapchat.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Snapchat link (e.g. snapchat.com/add/username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'twitch',
    name: 'Twitch',
    domain: 'twitch.tv',
    placeholder: 'https://twitch.tv/username',
    exampleUrl: 'https://twitch.tv/myresellerbrand',
    brandColor: '#9146FF',
    brandBgColor: '#F3ECFF',
    category: 'video',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?twitch\.tv\/[a-zA-Z0-9_]+\/?$/i.test(formatted) || formatted.includes('twitch.tv/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Twitch channel URL (e.g. twitch.tv/channel)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'discord',
    name: 'Discord',
    domain: 'discord.gg',
    placeholder: 'https://discord.gg/invitecode',
    exampleUrl: 'https://discord.gg/myresellercommunity',
    brandColor: '#5865F2',
    brandBgColor: '#EEF0FF',
    category: 'messaging',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?(discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('discord.');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Discord invite link (e.g. discord.gg/code)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    domain: 'pinterest.com',
    placeholder: 'https://pinterest.com/username',
    exampleUrl: 'https://pinterest.com/myresellerbrand',
    brandColor: '#BD081C',
    brandBgColor: '#FDE8EA',
    category: 'social',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?pinterest\.com\/[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('pinterest.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Pinterest profile URL (e.g. pinterest.com/username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    domain: 'wa.me',
    placeholder: 'https://wa.me/1234567890',
    exampleUrl: 'https://wa.me/15551234567',
    brandColor: '#25D366',
    brandBgColor: '#E8F9EE',
    category: 'messaging',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\/.+/i.test(formatted) || formatted.includes('wa.me/') || formatted.includes('whatsapp.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid WhatsApp wa.me link or chat link',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'reddit',
    name: 'Reddit',
    domain: 'reddit.com',
    placeholder: 'https://reddit.com/r/community',
    exampleUrl: 'https://reddit.com/user/myresellerbrand',
    brandColor: '#FF4500',
    brandBgColor: '#FFF0EB',
    category: 'social',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?reddit\.com\/(r|user|u)\/[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('reddit.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Reddit community or user profile link',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'threads',
    name: 'Threads',
    domain: 'threads.net',
    placeholder: 'https://www.threads.net/@username',
    exampleUrl: 'https://www.threads.net/@myresellerbrand',
    brandColor: '#000000',
    brandBgColor: '#F4F4F5',
    category: 'social',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?threads\.net\/@[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('threads.net/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Threads link (e.g. threads.net/@username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    domain: 'github.com',
    placeholder: 'https://github.com/username',
    exampleUrl: 'https://github.com/myresellerbrand',
    brandColor: '#181717',
    brandBgColor: '#F3F4F6',
    category: 'developer',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('github.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid GitHub profile URL (e.g. github.com/username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'medium',
    name: 'Medium',
    domain: 'medium.com',
    placeholder: 'https://medium.com/@username',
    exampleUrl: 'https://medium.com/@myresellerbrand',
    brandColor: '#000000',
    brandBgColor: '#F9FAFB',
    category: 'web',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?(www\.)?medium\.com\/@[a-zA-Z0-9._-]+\/?$/i.test(formatted) || formatted.includes('medium.com/');
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid Medium profile URL (e.g. medium.com/@username)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'website',
    name: 'Website',
    domain: 'mywebsite.com',
    placeholder: 'https://www.mywebsite.com',
    exampleUrl: 'https://www.myresellerbrand.com',
    brandColor: '#10B981',
    brandBgColor: '#ECFDF5',
    category: 'web',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i.test(formatted);
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid web address (e.g. https://mybrand.com)',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'blog',
    name: 'Blog',
    domain: 'blog.com',
    placeholder: 'https://blog.mywebsite.com',
    exampleUrl: 'https://blog.myresellerbrand.com',
    brandColor: '#8B5CF6',
    brandBgColor: '#F5F3FF',
    category: 'web',
    validate: (url: string) => {
      const formatted = formatUrlWithProtocol(url);
      if (!url.trim()) return { isValid: false, error: 'URL is required', formattedUrl: '' };
      const isValid = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i.test(formatted);
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid web link to your blog',
        formattedUrl: formatted,
      };
    },
  },
  {
    id: 'email',
    name: 'Email Contact',
    domain: 'email',
    placeholder: 'contact@mybrand.com',
    exampleUrl: 'support@myresellerbrand.com',
    brandColor: '#EA4335',
    brandBgColor: '#FCE8E6',
    category: 'messaging',
    validate: (url: string) => {
      const cleaned = url.replace(/^mailto:/i, '').trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
      const formatted = `mailto:${cleaned}`;
      return {
        isValid,
        error: isValid ? undefined : 'Must be a valid email address (e.g. name@domain.com)',
        formattedUrl: formatted,
      };
    },
  },
];

export const SOCIAL_PLATFORMS_MAP = SOCIAL_PLATFORMS.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<string, SocialPlatformInfo>);

export function getSocialPlatformInfo(platformId: string): SocialPlatformInfo {
  return (
    SOCIAL_PLATFORMS_MAP[platformId.toLowerCase()] || {
      id: platformId as SocialPlatformId,
      name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
      domain: 'link',
      placeholder: 'https://...',
      exampleUrl: 'https://link.com',
      brandColor: '#059669',
      brandBgColor: '#ECFDF5',
      category: 'other',
      validate: (url: string) => {
        const formatted = formatUrlWithProtocol(url);
        return {
          isValid: Boolean(url.trim()),
          formattedUrl: formatted,
        };
      },
    }
  );
}

export function generateInitialSocialLinks(storefrontId: string): StorefrontSocialLink[] {
  const now = new Date().toISOString();
  return [
    {
      id: `link_${storefrontId}_1`,
      storefrontId,
      platform: 'instagram',
      url: 'https://instagram.com/suk_reseller_store',
      isVisible: true,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `link_${storefrontId}_2`,
      storefrontId,
      platform: 'x',
      url: 'https://x.com/suk_resellers',
      isVisible: true,
      displayOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `link_${storefrontId}_3`,
      storefrontId,
      platform: 'facebook',
      url: 'https://facebook.com/sukresellerhub',
      isVisible: true,
      displayOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `link_${storefrontId}_4`,
      storefrontId,
      platform: 'tiktok',
      url: 'https://www.tiktok.com/@suk_official',
      isVisible: true,
      displayOrder: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `link_${storefrontId}_5`,
      storefrontId,
      platform: 'whatsapp',
      url: 'https://wa.me/15550192834',
      isVisible: true,
      displayOrder: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `link_${storefrontId}_6`,
      storefrontId,
      platform: 'youtube',
      url: 'https://youtube.com/@sukreseller',
      isVisible: false,
      displayOrder: 6,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `link_${storefrontId}_7`,
      storefrontId,
      platform: 'discord',
      url: 'https://discord.gg/sukresellers',
      isVisible: false,
      displayOrder: 7,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
