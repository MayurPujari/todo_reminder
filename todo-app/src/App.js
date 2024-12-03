import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, List, ListItem, ListItemText, IconButton, Typography, Box, Container, AppBar, Toolbar } from '@mui/material';
import { Edit, Delete, DeleteForever } from '@mui/icons-material';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [todoText, setTodoText] = useState('');
  const [editTodoText, setEditTodoText] = useState('');
  const [editTodoId, setEditTodoId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/todos')
      .then(response => {
        setTodos(response.data);
      })
      .catch(error => {
        console.error('Error fetching todos:', error);
      });
  }, []);

  const addTodo = () => {
    if (todoText) {
      axios.post('http://localhost:5000/todos', { text: todoText })
        .then(response => {
          setTodos([...todos, response.data]);
          setTodoText('');
        })
        .catch(error => {
          console.error('Error adding todo:', error);
        });
    }
  };

  const editTodo = () => {
    if (editTodoText) {
      axios.put(`http://localhost:5000/todos/${editTodoId}`, { text: editTodoText })
        .then(() => {
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
    axios.delete(`http://localhost:5000/todos/${todoId}`)
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== todoId));
      })
      .catch(error => {
        console.error('Error deleting todo:', error);
      });
  };

  const deleteAllTodos = () => {
    axios.delete('http://localhost:5000/todos/delete_all')
      .then(() => {
        setTodos([]);
      })
      .catch(error => {
        console.error('Error deleting all todos:', error);
      });
  };

  return (
    <Container maxWidth="sm">
      <AppBar position="static" sx={{ marginBottom: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo App
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <TextField
          label="Add a new Todo"
          variant="outlined"
          fullWidth
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ height: '100%' }}
          onClick={addTodo}
        >
          Add
        </Button>
      </Box>
      {editTodoId && (
        <Box sx={{ marginBottom: 3 }}>
          <TextField
            label="Edit Todo"
            variant="outlined"
            fullWidth
            value={editTodoText}
            onChange={(e) => setEditTodoText(e.target.value)}
          />
          <Button
            variant="contained"
            color="secondary"
            sx={{ marginTop: 2 }}
            onClick={editTodo}
          >
            Save
          </Button>
        </Box>
      )}
      <List sx={{ backgroundColor: '#f9f9f9', borderRadius: 2 }}>
        {todos.map(todo => (
          <ListItem key={todo.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2, '&:hover': { backgroundColor: '#f1f1f1' } }}>
            <ListItemText primary={todo.text} />
            <Box>
              <IconButton onClick={() => { setEditTodoText(todo.text); setEditTodoId(todo.id); }}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => deleteTodo(todo.id)}>
                <Delete />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>
      {todos.length > 0 && (
        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{ marginTop: 3 }}
          onClick={deleteAllTodos}
        >
          <DeleteForever sx={{ marginRight: 1 }} /> Delete All Todos
        </Button>
      )}
    </Container>
  );
};

export default TodoApp;
