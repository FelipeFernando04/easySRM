const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.post('/login', apiController.login);

// Rotas de Produtos
router.get('/products', apiController.getProducts);
router.post('/products', apiController.addProduct);
router.delete('/products/:id', apiController.deleteProduct);

// Rotas de Pedidos
router.get('/orders', apiController.getOrders);
router.post('/orders', apiController.addOrder);

// NOVAS ROTAS: Perfil do Fornecedor e Avaliações
router.get('/suppliers-info', apiController.getSuppliersInfo);
router.put('/users/:id', apiController.updateProfile);
router.get('/evaluations', apiController.getEvaluations);
router.post('/evaluations', apiController.addEvaluation);

module.exports = router;