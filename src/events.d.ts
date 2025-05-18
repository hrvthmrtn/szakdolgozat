
export interface Event {
      id: number;
      title: string;
      description: string;
      location: string | null;
      start_time: string; 
      end_time: string | null;
      created_at: string;
      updated_at: string;
      created_by: string | null;
    }
    