// src/components/AddTodoForm.tsx
import React, { useState, FormEvent } from 'react';

interface AddTodoFormProps {
  onAddTodo: (title: string, description: string) => Promise<void>; // Trả về Promise để xử lý loading/error
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onAddTodo(title.trim(), description.trim());
      setTitle(''); // Clear form on success
      setDescription('');
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-form">
       <h2>Add New Todo</h2>
       {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Todo title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
        required
      />
      <textarea
        placeholder="Optional description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  );
};

export default AddTodoForm;