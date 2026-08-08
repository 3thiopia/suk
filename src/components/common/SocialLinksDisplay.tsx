import React from 'react';
import { StorefrontCustomization, SocialPlacement, StorefrontSocialLink } from '../../types';
import { storage } from '../../lib/storage';
import { SocialPlatformIcon } from './SocialPlatformIcon';
import { getSocialPlatformInfo } from '../../lib/socialPlatforms';

interface SocialLinksDisplayProps {
  storefrontId: string;
  targetPlacement: SocialPlacement;
  customization: StorefrontCustomization;
  overrideLinks?: StorefrontSocialLink[];
  className?: string;
  showLabels?: boolean;
}

export function SocialLinksDisplay({
  storefrontId,
  targetPlacement,
  customization,
  overrideLinks,
  className = '',
  showLabels = false,
}: SocialLinksDisplayProps) {
  const config = customization.socialDisplayConfig || {
    placements: ['header', 'footer', 'about', 'contact'],
    alignment: 'center',
    size: 'medium',
    style: 'filled',
    useThemeColors: true,
    customColor: customization.colors.primary,
    customHoverColor: customization.colors.primary,
    customBgColor: `${customization.colors.primary}15`,
    borderRadius: 12,
    spacing: 12,
    hoverAnimation: 'lift',
  };

  // Check if current placement is enabled
  if (!config.placements.includes(targetPlacement)) {
    return null;
  }

  // Get social links
  const allLinks = overrideLinks || storage.getStorefrontSocialLinks(storefrontId);
  const enabledLinks = allLinks
    .filter((l) => l.isVisible && l.url && l.url.trim().length > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (enabledLinks.length === 0) {
    return null;
  }

  // Alignment classes
  const getAlignmentClass = () => {
    switch (config.alignment) {
      case 'left':
        return 'justify-start text-left';
      case 'right':
        return 'justify-end text-right';
      case 'center':
      default:
        return 'justify-center text-center';
    }
  };

  return (
    <div className={`w-full flex flex-wrap items-center ${getAlignmentClass()} ${className}`}>
      <div
        className="flex flex-wrap items-center"
        style={{ gap: `${config.spacing}px` }}
        role="navigation"
        aria-label="Social Media Connections"
      >
        {enabledLinks.map((link) => {
          const info = getSocialPlatformInfo(link.platform);
          return (
            <a
              key={link.id}
              href={link.url}
              target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              aria-label={`Visit our ${info.name} profile (${link.url})`}
              className="group flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl"
            >
              <SocialPlatformIcon
                platform={link.platform}
                size={config.size}
                styleVariant={config.style}
                useThemeColor={config.useThemeColors}
                themePrimaryColor={customization.colors.primary}
                customColor={config.customColor}
                customHoverColor={config.customHoverColor}
                customBgColor={config.customBgColor}
                borderRadiusPx={config.borderRadius}
                hoverAnimation={config.hoverAnimation}
                showTooltip={true}
              />
              {showLabels && (
                <span className="text-xs font-bold text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  {info.name}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
