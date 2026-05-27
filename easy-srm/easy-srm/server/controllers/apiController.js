const fs = require('fs');
const path = require('path');

const readData = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, `../data/${file}.json`)));
const writeData = (file, data) => fs.writeFileSync(path.join(__dirname, `../data/${file}.json`), JSON.stringify(data, null, 2));

exports.login = (req, res) => {
  const users = readData('users');
  const user = users.find(u => u.username === req.body.username && u.password === req.body.password);
  if (user) {
    const { password, ...userData } = user;
    res.json({ success: true, user: userData });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
};

exports.getProducts = (req, res) => res.json(readData('products'));
exports.addProduct = (req, res) => {
  const products = readData('products');
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  writeData('products', products);
  res.json(newProduct);
};
exports.deleteProduct = (req, res) => {
  let products = readData('products').filter(p => p.id !== parseInt(req.params.id));
  writeData('products', products);
  res.json({ success: true });
};

exports.getOrders = (req, res) => res.json(readData('orders'));
exports.addOrder = (req, res) => {
  const orders = readData('orders');
  const newOrder = { id: Date.now(), status: 'Pendente', date: new Date().toLocaleDateString('pt-BR'), ...req.body };
  orders.push(newOrder);
  writeData('orders', orders);
  res.json(newOrder);
};

// --- NOVOS MÉTODOS ---

exports.getSuppliersInfo = (req, res) => {
  const users = readData('users').filter(u => u.role === 'Fornecedor');
  const safeUsers = users.map(({password, ...u}) => u); // Remove senhas
  res.json(safeUsers);
};

exports.updateProfile = (req, res) => {
  const users = readData('users');
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    writeData('users', users);
    res.json({ success: true, user: users[index] });
  } else {
    res.status(404).json({ error: 'Usuário não encontrado' });
  }
};

exports.getEvaluations = (req, res) => res.json(readData('evaluations'));
exports.addEvaluation = (req, res) => {
  const evaluations = readData('evaluations');
  const newEval = { id: Date.now(), date: new Date().toLocaleDateString('pt-BR'), ...req.body };
  evaluations.push(newEval);
  writeData('evaluations', evaluations);
  res.json(newEval);
};