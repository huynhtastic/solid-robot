const crypto = require('crypto');
const register = require('../db_apis/register.js');

async function post(req, res, next) {
  try {
    const context = req.body;
    const rows = await register.register(context);

    res.status(200).json(rows);

  } catch (err) {
    next(err);
  }
}

module.exports.post = post;
