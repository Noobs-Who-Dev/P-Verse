// Helper function to convert avatar URLs
export const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  if (!avatarUrl) {
    return '/images/design-mode/image.png'; // Default avatar
  }

  // If already a full URL, return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // If starts with /, prepend backend URL
  if (avatarUrl.startsWith('/')) {
    return `http://localhost:8080${avatarUrl}`;
  }

  // Otherwise, return as is (relative path)
  return avatarUrl;
};

