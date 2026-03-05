const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dataRole, dataUser } = require('./data2');

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to get current timestamp
const getCurrentTimestamp = () => new Date().toISOString();

// CRUD for Roles

// GET /roles - Get all roles
app.get('/roles', (req, res) => {
  res.json(dataRole);
});

// GET /roles/:id - Get role by id
app.get('/roles/:id', (req, res) => {
  const role = dataRole.find(r => r.id === req.params.id);
  if (!role) return res.status(404).json({ error: 'Role not found' });
  res.json(role);
});

// POST /roles - Create new role
app.post('/roles', (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) return res.status(400).json({ error: 'Name and description are required' });
  const newRole = {
    id: uuidv4(),
    name,
    description,
    creationAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  };
  dataRole.push(newRole);
  res.status(201).json(newRole);
});

// PUT /roles/:id - Update role
app.put('/roles/:id', (req, res) => {
  const role = dataRole.find(r => r.id === req.params.id);
  if (!role) return res.status(404).json({ error: 'Role not found' });
  const { name, description } = req.body;
  if (name) role.name = name;
  if (description) role.description = description;
  role.updatedAt = getCurrentTimestamp();
  res.json(role);
});

// DELETE /roles/:id - Delete role
app.delete('/roles/:id', (req, res) => {
  const index = dataRole.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Role not found' });
  dataRole.splice(index, 1);
  res.status(204).send();
});

// GET /roles/:id/users - Get all users in a role
app.get('/roles/:id/users', (req, res) => {
  const role = dataRole.find(r => r.id === req.params.id);
  if (!role) return res.status(404).json({ error: 'Role not found' });
  const users = dataUser.filter(u => u.role.id === req.params.id);
  res.json(users);
});

// CRUD for Users

// GET /users - Get all users
app.get('/users', (req, res) => {
  res.json(dataUser);
});

// GET /users/:id - Get user by id (using username as id)
app.get('/users/:id', (req, res) => {
  const user = dataUser.find(u => u.username === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /users - Create new user
app.post('/users', (req, res) => {
  const { username, password, email, fullName, avatarUrl, status, roleId } = req.body;
  if (!username || !password || !email || !fullName || !roleId) return res.status(400).json({ error: 'Required fields missing' });
  const role = dataRole.find(r => r.id === roleId);
  if (!role) return res.status(400).json({ error: 'Invalid roleId' });
  const newUser = {
    username,
    password,
    email,
    fullName,
    avatarUrl: avatarUrl || 'https://i.sstatic.net/l60Hf.png',
    status: status !== undefined ? status : true,
    loginCount: 0,
    role: {
      id: role.id,
      name: role.name,
      description: role.description
    },
    creationAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  };
  dataUser.push(newUser);
  res.status(201).json(newUser);
});

// PUT /users/:id - Update user
app.put('/users/:id', (req, res) => {
  const user = dataUser.find(u => u.username === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, email, fullName, avatarUrl, status, roleId } = req.body;
  if (password) user.password = password;
  if (email) user.email = email;
  if (fullName) user.fullName = fullName;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  if (status !== undefined) user.status = status;
  if (roleId) {
    const role = dataRole.find(r => r.id === roleId);
    if (!role) return res.status(400).json({ error: 'Invalid roleId' });
    user.role = {
      id: role.id,
      name: role.name,
      description: role.description
    };
  }
  user.updatedAt = getCurrentTimestamp();
  res.json(user);
});

// DELETE /users/:id - Delete user
app.delete('/users/:id', (req, res) => {
  const index = dataUser.findIndex(u => u.username === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  dataUser.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});