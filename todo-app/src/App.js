import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

API_URL = 'https://todo-reminder-indol.vercel.app/'

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [todoText, setTodoText] = useState('');
  const [editTodoText, setEditTodoText] = useState('');
  const [editTodoId, setEditTodoId] = useState(null);

  useEffect(() => {
    axios.get('{API_URL}todos')
      .then(response => {
        setTodos(response.data);
      })
      .catch(error => {
        console.error('Error fetching todos:', error);
      });
  }, []);

  const addTodo = () => {
    if (todoText) {
      axios.post('{API_URL}todos', { text: todoText })
        .then(response => {
          const newTodo = response.data;
          setTodos([...todos, newTodo]);
          setTodoText('');
        })
        .catch(error => {
          console.error('Error adding todo:', error);
        });
    }
  };

  const editTodo = () => {
    if (editTodoText) {
      axios.put(`{API_URL}todos/${editTodoId}`, { text: editTodoText })
        .then(response => {
          const updatedTodos = todos.map(todo =>
            todo.id === editTodoId ? { ...todo, text: editTodoText } : todo
          );
          setTodos(updatedTodos);
          setEditTodoText('');
          setEditTodoId(null);
        })
        .catch(error => {
          console.error('Error updating todo:', error);
        });
    }
  };

  const deleteTodo = (todoId) => {
    axios.delete(`{API_URL}todos/${todoId}`)
      .then(response => {
        setTodos(todos.filter(todo => todo.id !== todoId));
      })
      .catch(error => {
        console.error('Error deleting todo:', error);
      });
  };

  const deleteAllTodos = () => {
    axios.delete('{API_URL}todos/delete_all')
      .then(response => {
        setTodos([]);
      })
      .catch(error => {
        console.error('Error deleting all todos:', error);
      });
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Todo App</h1>
      <div className="mb-4">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Add a new Todo"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
        />
        <button className="btn btn-primary btn-block w-100" onClick={addTodo}>
          Add
        </button>
      </div>
      {editTodoId && (
        <div className="mb-4">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Edit Todo"
            value={editTodoText}
            onChange={(e) => setEditTodoText(e.target.value)}
          />
          <button className="btn btn-success btn-block w-100" onClick={editTodo}>
            Save
          </button>
        </div>
      )}
      <ul className="list-group">
        {todos.map(todo => (
          <li key={todo.id} className="list-group-item d-flex justify-content-between align-items-center">
            {todo.text}
            <div>
              <button
                className="btn btn-sm btn-warning me-2"
                onClick={() => { setEditTodoText(todo.text); setEditTodoId(todo.id); }}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {todos.length > 0 && (
        <button
          className="btn btn-danger btn-block mt-4 w-100"
          onClick={deleteAllTodos}
        >
          Delete All Todos
        </button>
      )}
    </div>
  );
};

export default TodoApp;