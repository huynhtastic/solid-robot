const express = require('express');
const router = new express.Router();
const employees = require('../controllers/employees.js');
const login = require('../controllers/login.js');
const register = require('../controllers/register.js');

router.route('/employees/:id?')
  .get(employees.get)
  .post(employees.post)
  .put(employees.put)
  .delete(employees.delete);

router.route('/login')
  .post(login.post);

router.route('/register')
  .post(register.post);

module.exports = router;
