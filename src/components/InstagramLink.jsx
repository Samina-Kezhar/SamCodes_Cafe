import React from 'react';
import { InstagramIcon } from './InstagramIcon';
import { validateAndFormatInstagram } from '../utils/instagram';

export function InstagramLink({
  handleOrUrl = 'cafena.nikol',
  children,
  className = '',
  style = {},
  showIcon = true,
  iconSize = 18,
  title,
  ariaLabel
}) {
  const result = validateAndFormatInstagram(handleOrUrl);

  if (!result.isValid) {
    return (
      <span
        className={`instagram-fallback-link ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.6,
          cursor: 'not-allowed',
          fontSize: '0.85rem',
          color: '#8c7e72',
          ...style
        }}
        title={`Social link unavailable: ${result.error}`}
        role="note"
        aria-label="Instagram handle unavailable"
      >
        {showIcon && <InstagramIcon size={iconSize} />}
        <span>{children || 'Instagram unavailable'}</span>
      </span>
    );
  }

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        textDecoration: 'none',
        ...style
      }}
      title={title || `Visit @${result.handle} on Instagram (opens in new tab)`}
      aria-label={ariaLabel || `Open @${result.handle} on Instagram in a new tab`}
    >
      {showIcon && <InstagramIcon size={iconSize} />}
      {children ? children : <span>@{result.handle}</span>}
    </a>
  );
}

export default InstagramLink;
