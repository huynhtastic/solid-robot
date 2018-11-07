const transactions = require('../db_apis/transactions.js');

async function get(req, res, next) {
  try {
    const context = {
      emp_id: parseInt(req.params.emp_id),
    };

    const rows = await transactions.getTransactions(context);

    if (rows !== 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
}

module.exports.get = get;
