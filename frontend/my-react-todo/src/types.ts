// src/types.ts
export interface Todo {
    id: number;
    title: string;
    description: string | null; // Cho phép null
    completed: boolean;
    created_at: string; // Dạng ISO string từ Django
  }