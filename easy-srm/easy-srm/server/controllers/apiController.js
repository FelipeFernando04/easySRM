const fs = require('fs');
const path = require('path');

const readData = (file) => {
  const filePath = path.join(__dirname, `../data/${file}.json`);
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};

const writeData = (file, data) => {
  const filePath = path.join(__dirname, `../data/${file}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const users = readData('users');
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
};

exports.getDashboard = (req, res) => {
  const suppliers = readData('suppliers');
  const evaluations = readData('evaluations');
  const purchases = readData('purchases');
  
  const totalSuppliers = suppliers.length;
  const avgRating = evaluations.length > 0 
    ? (evaluations.reduce((acc, curr) => acc + curr.rating, 0) / evaluations.length).toFixed(1)
    : 0;
  
  res.json({ totalSuppliers, avgRating, recentPurchases: purchases.slice(-5).reverse() });
};

exports.getSuppliers = (req, res) => res.json(readData('suppliers'));

exports.addSupplier = (req, res) => {
  const suppliers = readData('suppliers');
  const newSupplier = { id: Date.now(), ...req.body };
  suppliers.push(newSupplier);
  writeData('suppliers', suppliers);
  res.json(newSupplier);
};

exports.deleteSupplier = (req, res) => {
  let suppliers = readData('suppliers');
  suppliers = suppliers.filter(s => s.id !== parseInt(req.params.id));
  writeData('suppliers', suppliers);
  res.json({ success: true });
};

exports.getEvaluations = (req, res) => res.json(readData('evaluations'));

exports.addEvaluation = (req, res) => {
  const evaluations = readData('evaluations');
  const newEvaluation = { id: Date.now(), ...req.body };
  evaluations.push(newEvaluation);
  writeData('evaluations', evaluations);
  res.json(newEvaluation);
};

exports.getPurchases = (req, res) => res.json(readData('purchases'));

exports.addPurchase = (req, res) => {
  const purchases = readData('purchases');
  const newPurchase = { id: Date.now(), ...req.body };
  purchases.push(newPurchase);
  writeData('purchases', purchases);
  res.json(newPurchase);
};