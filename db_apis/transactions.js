const oracledb = require('oracledb');
const database = require('../services/database.js');

const getTxnsQuery =
 ` SELECT txn_id, sender_id, sender, recipient_id,
    e.username recipient,
      amount, txn_date, message
      FROM(
      SELECT txn_id,
    sender_id, e.username sender,
    recipient_id,
    amount, txn_date, message
        FROM ktransactions k, employees e
WHERE k.sender_id = e.emp_id AND (k.recipient_id= :emp_id OR k.sender_id = :emp_id)
      ) a LEFT OUTER JOIN employees e
ON a.recipient_id = e.emp_id
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
