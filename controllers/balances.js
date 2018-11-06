const balances = require('../db_apis/balances.js');

async function get(req, res, next) {
  try {
    const context = {
      emp_id: parseInt(req.params.emp_id),
    };

    const rows = await balances.getBalances(context);

    if (rows.length === 1) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
}

module.exports.get = get;

async function post(req, res, next) {
  try {
    const context = req.body;

    const rows = await balances.makeTransaction(context);

    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports.post = post;
