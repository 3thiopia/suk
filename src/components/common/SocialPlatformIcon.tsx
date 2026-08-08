import React from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Twitch,
  MessageSquare,
  Pin,
  MessageCircle,
  Github,
  Globe,
  BookOpen,
  Mail,
  Send,
  AtSign,
  FileText,
  Video,
} from 'lucide-react';
import { SocialPlatformId, SocialSize, SocialStyle, SocialHoverAnimation } from '../../types';
import { getSocialPlatformInfo } from '../../lib/socialPlatforms';

interface SocialPlatformIconProps {
  key?: React.Key;
  platform: SocialPlatformId | string;
  size?: SocialSize | 'custom';
  customSizePx?: number;
  styleVariant?: SocialStyle;
  useThemeColor?: boolean;
  themePrimaryColor?: string;
  customColor?: string;
  customHoverColor?: string;
  customBgColor?: string;
  borderRadiusPx?: number;
  hoverAnimation?: SocialHoverAnimation;
  className?: string;
  showTooltip?: boolean;
}

export function SocialPlatformIcon({
  platform,
  size = 'medium',
  customSizePx,
  styleVariant = 'filled',
  useThemeColor = true,
  themePrimaryColor = '#059669',
  customColor,
  customHoverColor,
  customBgColor,
  borderRadiusPx = 12,
  hoverAnimation = 'lift',
  className = '',
  showTooltip = false,
}: SocialPlatformIconProps) {
  const info = getSocialPlatformInfo(platform);

  // Icon dimension map
  let iconPx = 20;
  let containerPx = 40;

  if (customSizePx) {
    iconPx = customSizePx;
    containerPx = Math.round(customSizePx * 2);
  } else {
    switch (size) {
      case 'small':
        iconPx = 16;
        containerPx = 32;
        break;
      case 'large':
        iconPx = 24;
        containerPx = 48;
        break;
      case 'medium':
      default:
        iconPx = 20;
        containerPx = 40;
        break;
    }
  }

  // Animation class map
  const getAnimationClass = () => {
    switch (hoverAnimation) {
      case 'lift':
        return 'transition-transform duration-200 hover:-translate-y-1';
      case 'scale':
        return 'transition-transform duration-200 hover:scale-110';
      case 'glow':
        return 'transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20';
      case 'bounce':
        return 'transition-transform duration-200 hover:animate-bounce';
      case 'spin':
        return 'transition-transform duration-300 hover:rotate-12 hover:scale-110';
      default:
        return 'transition-opacity duration-150 hover:opacity-80';
    }
  };

  // Color logic
  const iconColor = customColor
    ? customColor
    : useThemeColor
    ? styleVariant === 'filled'
      ? '#ffffff'
      : themePrimaryColor
    : styleVariant === 'filled'
    ? '#ffffff'
    : info.brandColor;

  const bgColor = customBgColor
    ? customBgColor
    : useThemeColor
    ? styleVariant === 'filled'
      ? themePrimaryColor
      : `${themePrimaryColor}15`
    : styleVariant === 'filled'
    ? info.brandColor
    : info.brandBgColor;

  // Custom SVG renderers for platforms without standard single-path lucide icons
  const renderIconGraphic = () => {
    const iconSizeClass = `h-[${iconPx}px] w-[${iconPx}px]`;
    const styleObj = { width: `${iconPx}px`, height: `${iconPx}px`, color: iconColor };

    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook style={styleObj} className={iconSizeClass} />;
      case 'instagram':
        return <Instagram style={styleObj} className={iconSizeClass} />;
      case 'x':
      case 'twitter':
        // Custom Crisp X SVG
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" style={styleObj} className={iconSizeClass}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" style={styleObj} className={iconSizeClass}>
            <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-2.883 2.891 2.893 2.893 0 01-2.895-2.891 2.893 2.893 0 012.895-2.892c.381 0 .742.072 1.074.204V9.456a6.33 6.33 0 00-1.074-.092 6.338 6.338 0 00-6.338 6.338 6.338 6.338 0 006.338 6.338 6.338 6.338 0 006.338-6.338V9.006a8.212 8.212 0 004.836 1.554V7.115a4.773 4.773 0 01-1.074-.429z" />
          </svg>
        );
      case 'telegram':
        return <Send style={styleObj} className={iconSizeClass} />;
      case 'youtube':
        return <Youtube style={styleObj} className={iconSizeClass} />;
      case 'linkedin':
        return <Linkedin style={styleObj} className={iconSizeClass} />;
      case 'snapchat':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" style={styleObj} className={iconSizeClass}>
            <path d="M12.003 2c-3.642 0-6.49 2.536-6.49 6.42 0 1.96.677 3.518 1.478 4.542.176.225.268.414.156.666-.144.32-.782.593-1.637.777-.384.083-.564.254-.537.498.058.535 1.05.787 1.956.812.378.01.625.138.745.385.397.818.107 1.474-.754 1.838-.474.201-.976.467-.976.877 0 .584 1.139.92 2.372 1.144.316.057.513.18.574.453.257 1.151 1.63 1.588 3.113 1.588 1.483 0 2.856-.437 3.113-1.588.061-.273.258-.396.574-.453 1.233-.224 2.372-.56 2.372-1.144 0-.41-.502-.676-.976-.877-.861-.364-1.151-1.02-.754-1.838.12-.247.367-.375.745-.385.906-.025 1.898-.277 1.956-.812.027-.244-.153-.415-.537-.498-.855-.184-1.493-.457-1.637-.777-.112-.252-.02-.441.156-.666.801-1.024 1.478-2.582 1.478-4.542 0-3.884-2.848-6.42-6.49-6.42z" />
          </svg>
        );
      case 'twitch':
        return <Twitch style={styleObj} className={iconSizeClass} />;
      case 'discord':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" style={styleObj} className={iconSizeClass}>
            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        );
      case 'pinterest':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" style={styleObj} className={iconSizeClass}>
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
          </svg>
        );
      case 'whatsapp':
        return <MessageCircle style={styleObj} className={iconSizeClass} />;
      case 'reddit':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" style={styleObj} className={iconSizeClass}>
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-4.566 3.465c-.135 0-.256.053-.347.143a.475.475 0 0 0 0 .684c.677.677 1.785.74 2.163.74.377 0 1.486-.063 2.163-.74a.487.487 0 0 0 0-.684.494.494 0 0 0-.685 0c-.394.394-1.12.484-1.478.484-.358 0-1.084-.09-1.478-.484a.475.475 0 0 0-.338-.143z" />
          </svg>
        );
      case 'threads':
        return <AtSign style={styleObj} className={iconSizeClass} />;
      case 'github':
        return <Github style={styleObj} className={iconSizeClass} />;
      case 'medium':
        return <FileText style={styleObj} className={iconSizeClass} />;
      case 'website':
        return <Globe style={styleObj} className={iconSizeClass} />;
      case 'blog':
        return <BookOpen style={styleObj} className={iconSizeClass} />;
      case 'email':
        return <Mail style={styleObj} className={iconSizeClass} />;
      default:
        return <Globe style={styleObj} className={iconSizeClass} />;
    }
  };

  // Border & shape styles
  const getContainerStyle = () => {
    switch (styleVariant) {
      case 'filled':
        return {
          backgroundColor: bgColor,
          borderRadius: `${borderRadiusPx}px`,
          width: `${containerPx}px`,
          height: `${containerPx}px`,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: `1.5px solid ${iconColor}`,
          borderRadius: `${borderRadiusPx}px`,
          width: `${containerPx}px`,
          height: `${containerPx}px`,
        };
      case 'rounded':
        return {
          backgroundColor: bgColor,
          borderRadius: '9999px',
          width: `${containerPx}px`,
          height: `${containerPx}px`,
        };
      case 'square':
        return {
          backgroundColor: bgColor,
          borderRadius: '4px',
          width: `${containerPx}px`,
          height: `${containerPx}px`,
        };
      case 'minimal':
      default:
        return {
          backgroundColor: 'transparent',
          width: `${containerPx}px`,
          height: `${containerPx}px`,
        };
    }
  };

  return (
    <div
      title={showTooltip ? info.name : undefined}
      style={getContainerStyle()}
      className={`relative flex items-center justify-center shrink-0 cursor-pointer ${getAnimationClass()} ${className}`}
    >
      {renderIconGraphic()}
    </div>
  );
}
