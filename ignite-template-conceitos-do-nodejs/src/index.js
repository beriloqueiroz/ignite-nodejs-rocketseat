const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.find(user => user.username == username);
  if (!userExists) {
    return response.status(404).json({ error: "usuário não existe" });
  }
  request.user = userExists;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExists = users.find(user => user.username == username);
  if (userExists) return response.status(400).json({ error: "usuário já existe" });
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;
  const todo = user.todos.find(td => td.id === id);
  if (!todo) {
    return response.status(404).json({ error: "todo não encontrado" });
  }
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find(td => td.id == id);
  if (!todo) {
    return response.status(404).json({ error: "todo não encontrado" });
  }
  todo.done = true;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const todoIndex = user.todos.findIndex(td => td.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({ error: "todo não existe" });
  }
  user.todos.splice(todoIndex, 1);
  return response.status(204).json();
});

module.exports = app;