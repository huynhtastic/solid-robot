const express = require('express');
const router = new express.Router();
const employees = require('../controllers/employees.js');
const login = require('../controllers/login.js');
const register = require('../controllers/register.js');
const transactions = require('../controllers/transactions.js');
const balances = require('../controllers/balances.js');

router.route('/employees/:id?')
  .get(employees.get)
  .post(employees.post)
  .put(employees.put)
  .delete(employees.delete);

router.route('/login')
  .post(login.post);

router.route('/register')
  .post(register.post);

router.route('/balances/:emp_id?')
  .get(balances.get)
  .post(balances.post);

router.route('/transactions/:emp_id?')
  .get(transactions.get)
  .post(transactions.post);

module.exports = router;
