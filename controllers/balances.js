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
