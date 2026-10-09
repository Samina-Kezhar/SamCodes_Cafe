/**
 * Validates and formats Instagram handles and URLs.
 * Handles formats: '@handle', 'handle', 'https://instagram.com/handle', etc.
 * Enforces Instagram username rules: 1-30 characters, letters, numbers, periods, underscores.
 * Cannot start or end with a period, cannot contain consecutive periods.
 */
export function validateAndFormatInstagram(input) {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      handle: '',
      url: '',
      error: 'Instagram handle or link is missing.'
    };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      handle: '',
      url: '',
      error: 'Instagram handle cannot be empty.'
    };
  }

  // Extract handle from URL if a URL was provided
  let handle = trimmed;
  const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
  if (urlMatch && urlMatch[1]) {
    handle = urlMatch[1];
  } else {
    // Strip leading @ or slashes and trailing slashes
    handle = handle.replace(/^[@/]+/, '').replace(/\/+$/, '');
  }

  // Check Instagram username rules
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
    return {
      isValid: false,
      handle,
      url: '',
      error: 'Invalid handle format. Must be 1-30 alphanumeric characters, underscores, or periods.'
    };
  }

  if (handle.startsWith('.') || handle.endsWith('.')) {
    return {
      isValid: false,
      handle,
      url: '',
      error: 'Instagram username cannot start or end with a period.'
    };
  }

  if (handle.includes('..')) {
    return {
      isValid: false,
      handle,
      url: '',
      error: 'Instagram username cannot contain consecutive periods.'
    };
  }

  return {
    isValid: true,
    handle,
    url: `https://www.instagram.com/${handle}`,
    error: null
  };
}
