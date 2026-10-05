import type { ItemKind } from './items';

export type Preset = {
  id: string;
  name: string;
  kind: ItemKind;
  repeat: string;
};

export const PRESETS: Preset[] = [
  { id: 'netflix', name: 'Netflix', kind: 'subscription', repeat: '1-month' },
  { id: 'spotify', name: 'Spotify', kind: 'subscription', repeat: '1-month' },
  { id: 'disney', name: 'Disney+', kind: 'subscription', repeat: '1-month' },
  { id: 'prime', name: 'Amazon Prime', kind: 'subscription', repeat: '1-year' },
  {
    id: 'gym',
    name: 'Gym membership',
    kind: 'subscription',
    repeat: '1-month',
  },
  { id: 'id-card', name: 'ID card', kind: 'document', repeat: 'none' },
  { id: 'passport', name: 'Passport', kind: 'document', repeat: 'none' },
  { id: 'licence', name: 'Driving licence', kind: 'document', repeat: 'none' },
  {
    id: 'car-insurance',
    name: 'Car insurance',
    kind: 'contract',
    repeat: '1-year',
  },
  {
    id: 'home-insurance',
    name: 'Home insurance',
    kind: 'contract',
    repeat: '1-year',
  },
  { id: 'phone', name: 'Phone plan', kind: 'contract', repeat: '1-month' },
  { id: 'energy', name: 'Energy contract', kind: 'contract', repeat: '1-year' },
];

export function findPreset(id: unknown): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
