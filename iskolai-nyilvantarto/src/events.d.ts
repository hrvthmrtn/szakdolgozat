// types.d.ts vagy events.d.ts
export interface Event {
      id: number;
      title: string;
      description: string;
      location: string | null;
      start_time: string; // használhatsz ISO 8601 formátumot (pl. "2024-11-08T14:00:00Z")
      end_time: string | null;
      created_at: string;
      updated_at: string;
      created_by: string | null;
    }
    