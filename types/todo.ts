export type Todo = {
  id: string;
  title: string;
  status: string;
  task_id?: string;
  memo?: string;
  sort_order?: number;
  is_private?: boolean;
  user_id?: string;
  updated_at?: string;
  total_time?: number | number[];
  is_timing?: boolean;
};
