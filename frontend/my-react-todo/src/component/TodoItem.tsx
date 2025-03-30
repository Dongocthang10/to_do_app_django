// src/components/TodoItem.tsx
import React from 'react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
  // Có thể thêm onEdit sau này
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleComplete, onDelete }) => {
  const handleToggle = () => {
    onToggleComplete(todo.id, todo.completed);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-info">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        <span className="todo-title">{todo.title}</span>
        {todo.description && <p className="todo-description">{todo.description}</p>}
         <small>Created: {new Date(todo.created_at).toLocaleString()}</small>
      </div>
      <div className="todo-actions">
        <button onClick={handleDelete} className="delete-btn">Delete</button>
        {/* Nút Edit có thể thêm ở đây */}
      </div>
    </li>
  );
};

export default TodoItem;