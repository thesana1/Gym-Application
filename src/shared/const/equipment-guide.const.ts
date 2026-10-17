import type { AvailableEquipment } from '@/shared/const/fitness.const';

export type EquipmentGuideEntry = {
  equipment: AvailableEquipment;
  title: string;
  purpose: string;
  primaryUse: string;
  setup: string[];
  safetyNotes: string[];
};

export const EQUIPMENT_GUIDE: EquipmentGuideEntry[] = [
  {
    equipment: 'dumbbells',
    title: 'Dumbbells',
    purpose: 'Free weights used for independent, one-sided, and bilateral movements.',
    primaryUse: 'Resistance training for the upper body and lower body.',
    setup: [
      'Choose a light load that you can move with control.',
      'Place weights on a stable surface and clear the space around you.',
      'Follow an exercise-specific setup and keep both sides controlled.',
    ],
    safetyNotes: [
      'Check handles and plates before use; do not use damaged equipment.',
      'Avoid lifting a weight that makes you lose balance or control.',
      'Ask for help positioning heavy weights if you are unsure.',
    ],
  },
  {
    equipment: 'resistance-bands',
    title: 'Resistance bands',
    purpose: 'Elastic resistance that increases as the band stretches.',
    primaryUse: 'Light pulling, pressing, and warm-up movements.',
    setup: [
      'Inspect the entire band for cracks, tears, or worn areas.',
      'If using an anchor, confirm it is designed for the band and securely fixed.',
      'Begin with light tension and maintain control as the band returns.',
    ],
    safetyNotes: [
      'Do not use a damaged band or an improvised, unstable anchor.',
      'Keep the band away from your face and other people.',
      'Do not let the band snap back; release tension gradually.',
    ],
  },
  {
    equipment: 'gym-machines',
    title: 'Resistance machines',
    purpose: 'Fixed-path resistance equipment with adjustable seats, handles, or loads.',
    primaryUse: 'Guided resistance exercises with a machine-specific movement path.',
    setup: [
      'Read the machine label and identify the adjustment points.',
      'Set the seat and start position so the handles feel comfortably reachable.',
      'Test the movement with a light setting before adding resistance.',
    ],
    safetyNotes: [
      'Check that adjustment pins are fully seated and supports are stable.',
      'Keep the movement controlled; do not let the weight stack drop.',
      'Ask gym staff for help if the machine setup or operation is unclear.',
    ],
  },
  {
    equipment: 'barbell',
    title: 'Barbells',
    purpose: 'A long bar used with plates for compound resistance exercises.',
    primaryUse: 'Loaded strength exercises that require secure setup and technique.',
    setup: [
      'Learn the movement with a lighter or unloaded variation first.',
      'Check collars, rack height, and safety arms before loading the bar.',
      'Use a setup that lets you return the bar safely without overreaching.',
    ],
    safetyNotes: [
      'Do not attempt a heavy lift alone or without appropriate safety equipment.',
      'Use a trained spotter when the movement and equipment call for one.',
      'Stop if you cannot maintain control or experience pain or unusual symptoms.',
    ],
  },
];
