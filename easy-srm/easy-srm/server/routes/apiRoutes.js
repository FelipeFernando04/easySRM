const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.post('/login', apiController.login);
router.get('/dashboard', apiController.getDashboard);
router.get('/suppliers', apiController.getSuppliers);
router.post('/suppliers', apiController.addSupplier);
router.delete('/suppliers/:id', apiController.deleteSupplier);
router.get('/evaluations', apiController.getEvaluations);
router.post('/evaluations', apiController.addEvaluation);
router.get('/purchases', apiController.getPurchases);
router.post('/purchases', apiController.addPurchase);

module.exports = router;