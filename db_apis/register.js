const oracledb = require('oracledb');
const database = require('../services/database.js');

const registerQuery = 
  `INSERT INTO employees
  (username, password, first_name, last_name, email, admin)
  VALUES
  (:username, :password, :firstName, :lastName, :email, :admin)`;
  
async function register(context) {
  let query = registerQuery;
  const binds = context;

  console.log(binds);
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.register = register;
