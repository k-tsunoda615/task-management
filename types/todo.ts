import type { TaskStatus } from "../utils/constants";

export type Tag = {
  id: string;
  name: string;
  color?: string;
  sort_order: number;
};

export type Todo = {
  id: string;
  title: string;
  status: TaskStatus;
  task_id?: string;
  memo?: string;
  sort_order?: number;
  is_private?: boolean;
  user_id?: string;
  updated_at?: string;
  total_time?: number | number[];
  is_timing?: boolean;
  tags?: Tag[];
};
