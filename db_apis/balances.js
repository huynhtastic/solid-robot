const oracledb = require('oracledb');
const database = require('../services/database.js');

const getTxnQuery =
  `SELECT points_received, points_giveable, gift_cards
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

const makeTxnQuery =
  `BEGIN giveKudos(:sender_id, :recipient_username, :amount, :txn_date, :message); END;`;

const resetPointsQuery =
  `BEGIN rlh3482.resetPoints; END;`;

async function makeTransaction(context) {
  let query = makeTxnQuery;
  const binds = context;

  console.log(binds);

  const result = await database.simpleExecute(query, binds);

  console.log(result);
  return result.rows;
}

module.exports.makeTransaction = makeTransaction;
