const oracledb = require('oracledb');
const database = require('../services/database.js');

const getTxnsQuery =
  `SELECT e.username, k.amount, k.message
   FROM employees e, ktransactions k
   WHERE e.emp_id = k.sender_id AND k.recipient_id= :emp_id
   ORDER BY txn_date ASC`;

async function getTransactions(context) {
  let query = getTxnsQuery;
  const binds = context;

  console.log(binds);
  const result = await database.simpleExecute(query, binds);
  console.log(result);

  return result.rows;
}

module.exports.getTransactions = getTransactions;

const redeemQuery =
  `BEGIN redeemGiftCard(:emp_id); END;`;

async function makeTransaction(context) {
  let query = redeemQuery;
  const binds = context;

  console.log(query);
  console.log(binds);

  const result = await database.simpleExecute(query, binds);

  console.log(result);
  return result.rows;
}

module.exports.makeTransaction = makeTransaction;
