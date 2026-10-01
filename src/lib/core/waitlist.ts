export const TRACK_OPTIONS = [
  'Subscriptions',
  'Documents',
  'Contracts & insurance',
] as const;

export type TrackOption = (typeof TRACK_OPTIONS)[number];

export function isTrackOption(value: string): value is TrackOption {
  return (TRACK_OPTIONS as readonly string[]).includes(value);
}
