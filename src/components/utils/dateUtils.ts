/**
 * Format date to readable string (e.g., "Jun 9, 2026")
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date and time (e.g., "Jun 9, 2026, 2:30 PM")
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

/**
 * Format time only (e.g., "2:30 PM")
 */
export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

/**
 * Format distance from now (e.g., "2 days ago", "in 3 hours")
 */
export const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (Math.abs(diffMins) < 1) {
    return 'just now';
  } else if (Math.abs(diffMins) < 60) {
    const mins = Math.abs(diffMins);
    return diffMs > 0 ? `in ${mins}m` : `${mins}m ago`;
  } else if (Math.abs(diffHours) < 24) {
    const hours = Math.abs(diffHours);
    return diffMs > 0 ? `in ${hours}h` : `${hours}h ago`;
  } else {
    const days = Math.abs(diffDays);
    return diffMs > 0 ? `in ${days}d` : `${days}d ago`;
  }
};
