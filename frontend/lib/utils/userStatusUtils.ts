// User Status Utilities
import { UserStatus } from '@/lib/types/userStatus';

/**
 * Format last seen time with i18n support
 * @param lastSeenAt - ISO timestamp of last activity
 * @param isOnline - Whether user is currently online
 * @param t - Translation function from I18nContext
 * @returns Formatted last seen text
 */
export function getLastSeenText(
  lastSeenAt: string | undefined,
  isOnline: boolean,
  t: (key: any) => string
): string {
  if (isOnline) {
    return t('activeNow');
  }

  if (!lastSeenAt) {
    return t('activeLongAgo');
  }

  const lastSeenDate = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return t('activeNow');
  }

  if (diffMinutes < 60) {
    // For Vietnamese: "Hoạt động 5 phút trước"
    // For English: "Active 5m ago"
    const template = t('activeMinutesAgo');
    return template.replace('{minutes}', diffMinutes.toString());
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const template = t('activeHoursAgo');
    return template.replace('{hours}', diffHours.toString());
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return t('activeYesterday');
  }

  if (diffDays < 7) {
    const template = t('activeDaysAgo');
    return template.replace('{days}', diffDays.toString());
  }

  return t('activeLongAgo');
}

/**
 * Get status indicator configuration based on user status
 * @param status - UserStatus enum value
 * @returns Configuration object with color and visibility
 */
export function getStatusIndicator(status: UserStatus | null | undefined): {
  show: boolean;
  color: 'green' | 'gray';
  className: string;
} {
  switch (status) {
    case UserStatus.ONLINE:
      return {
        show: true,
        color: 'green',
        className: 'bg-green-500'
      };
    case UserStatus.OFFLINE:
    default:
      return {
        show: false,
        color: 'gray',
        className: 'bg-gray-400'
      };
  }
}

/**
 * Check if user should show as online
 * @param status - UserStatus enum value
 * @returns true if status is ONLINE
 */
export function isUserOnline(status: UserStatus | null | undefined): boolean {
  return status === UserStatus.ONLINE;
}

/**
 * Get short time text for avatar overlay (Facebook style)
 * @param lastSeenAt - ISO timestamp of last activity
 * @param t - Translation function from I18nContext
 * @returns Short time text like "5m", "2h", "3d" (EN) or "5p", "2g", "3n" (VI)
 */
export function getShortLastSeenText(
  lastSeenAt: string | undefined,
  t: (key: any) => string
): string | null {
  if (!lastSeenAt) {
    return null;
  }

  const lastSeenDate = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return null; // Just now = don't show text
  }

  if (diffMinutes < 60) {
    // EN: "5m", VI: "5p" (phút)
    const template = t('shortMinutesAgo');
    return template.replace('{minutes}', diffMinutes.toString());
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    // EN: "2h", VI: "2g" (giờ)
    const template = t('shortHoursAgo');
    return template.replace('{hours}', diffHours.toString());
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    // EN: "3d", VI: "3n" (ngày)
    const template = t('shortDaysAgo');
    return template.replace('{days}', diffDays.toString());
  }

  // More than 7 days - don't show
  return null;
}

