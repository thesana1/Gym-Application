import { z } from 'zod';

export const NearbyGymsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type NearbyGymsQueryType = z.infer<typeof NearbyGymsQuerySchema>;
