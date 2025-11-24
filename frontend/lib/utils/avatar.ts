// Helper function to convert avatar URLs
export const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  if (!avatarUrl) {
    return '/placeholder-user.jpg'; // Default avatar
  }

  // If already a full URL, return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // Remove leading slash if present to avoid double slash
  const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl;

  // Prepend backend URL
  return `http://localhost:8080/${cleanPath}`;
};

