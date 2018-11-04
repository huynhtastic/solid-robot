const oracledb = require('oracledb');
const database = require('../services/database.js');

const getTxnQuery =
  `SELECT points_received, points_giveable
   FROM Employees
   WHERE emp_id = :emp_id
  `;

async function getBalances(context) {
  let query = getTxnQuery;
  const binds = context;

  console.log(binds);
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.getBalances = getBalances;
