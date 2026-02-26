export function parseDurationToMinutes(duration: string | null | undefined): number {
  if (!duration) return 60;
  const match = duration.match(/PT(\d+)M/);
  return match ? parseInt(match[1]) : 60;
}

export function formatDurationToISO(minutes: number): string {
  return `PT${minutes}M`;
}

export function formatDuration(duration: string | null | undefined): string {
  if (!duration) return '60 min';
  const minutes = parseDurationToMinutes(duration);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
