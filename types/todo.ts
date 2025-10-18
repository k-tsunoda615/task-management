import type { TaskStatus } from "../app/utils/constants";

export type Tag = {
  id: string;
  name: string;
  color?: string;
  sort_order: number;
};

export type TodoAsset = {
  id: string;
  todo_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size: number;
  created_at?: string;
  created_by?: string;
};

export type Todo = {
  id: string;
  title: string;
  status: TaskStatus;
  task_id?: string;
  memo?: string;
  sort_order?: number;
  is_private?: boolean;
  is_finished?: boolean;
  user_id?: string;
  updated_at?: string;
  total_time?: number | number[];
  is_timing?: boolean;
  tags?: Tag[];
  assets?: TodoAsset[];
};
