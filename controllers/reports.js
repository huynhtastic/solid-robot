const reports = require('../db_apis/reports.js');

async function get(req, res, next) {
  try {
    const context = {
      report_id: parseInt(req.params.report_id),
    };

    const rows = await reports.getReport(context);

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
