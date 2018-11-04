const oracledb = require('oracledb');
const database = require('../services/database.js');

const loginQuery =
  `SELECT emp_id, password, admin
   FROM Employees
   WHERE username = :username
  `;

async function attemptLogin(context) {
  let query = loginQuery;
  const binds = context;

  console.log(binds);
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.attemptLogin = attemptLogin;
