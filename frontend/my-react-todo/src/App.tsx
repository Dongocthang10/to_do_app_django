// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Hoặc dùng fetch
import { Todo } from './types';
import TodoList from './component/TodoList';
import AddTodoForm from './component/TodoForm';
import './App.css'; // Import CSS

// Địa chỉ API của Django backend
const API_URL = 'http://127.0.0.1:8000/api/todos/'; // Thay đổi nếu URL khác

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm fetch todos từ API
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Todo[]>(API_URL);
      // Sắp xếp lại theo ID giảm dần hoặc created_at nếu cần (API đã sắp xếp)
      setTodos(response.data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      setError("Could not load todos. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi fetchTodos khi component mount lần đầu
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]); // fetchTodos là dependency

  // Hàm thêm todo mới
  const handleAddTodo = async (title: string, description: string) => {
    // Không cần setLoading/setError ở đây vì AddTodoForm đã xử lý
    try {
      const response = await axios.post<Todo>(API_URL, { title, description });
      // Thêm todo mới vào đầu danh sách (hoặc cuối tùy ý)
      setTodos(prevTodos => [response.data, ...prevTodos]);
    } catch (err) {
       console.error("Failed to add todo:", err);
       // Ném lỗi lại để AddTodoForm có thể bắt và hiển thị
       throw err;
    }
  };

  // Hàm toggle trạng thái completed
  const handleToggleComplete = async (id: number, currentStatus: boolean) => {
     // Cập nhật UI ngay lập tức để tạo cảm giác nhanh nhạy
     const originalTodos = [...todos];
     setTodos(prevTodos =>
         prevTodos.map(todo =>
             todo.id === id ? { ...todo, completed: !currentStatus } : todo
         )
     );

    try {
      // Gửi request PUT để cập nhật trạng thái trên server
      // Lưu ý: Chỉ gửi trường 'completed' để thay đổi
      await axios.put(`<span class="math-inline">\{API\_URL\}</span>{id}/`, { completed: !currentStatus });
      // Nếu thành công, UI đã được cập nhật rồi
    } catch (err) {
      console.error("Failed to toggle todo:", err);
      setError(`Failed to update todo #${id}. Reverting changes.`);
      // Nếu lỗi, khôi phục lại trạng thái cũ
      setTodos(originalTodos);
       // Hiển thị lỗi lâu hơn một chút
      setTimeout(() => setError(null), 5000);
    }
  };

  // Hàm xóa todo
  const handleDeleteTodo = async (id: number) => {
     // Cập nhật UI ngay lập tức
     const originalTodos = [...todos];
     setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));

    try {
      await axios.delete(`<span class="math-inline">\{API\_URL\}</span>{id}/`);
      // Nếu thành công, UI đã được cập nhật
    } catch (err) {
      console.error("Failed to delete todo:", err);
       setError(`Failed to delete todo #${id}. Reverting changes.`);
      // Nếu lỗi, khôi phục lại
      setTodos(originalTodos);
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="container">
      <h1>React Todo App</h1>
      <hr />
      <AddTodoForm onAddTodo={handleAddTodo} />
      <hr />
      <h2>Current Todos</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && (
        <TodoList
          todos={todos}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
        />
      )}
    </div>
  );
};

export default App;