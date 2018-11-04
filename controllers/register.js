const crypto = require('crypto');
const register = require('../db_apis/register.js');

async function post(req, res, next) {
  try {
    hashedPass = crypto.createHash('sha256').update(req.body.password).digest('hex');
    console.log(typeof(hashedPass));

    const context = req.body;
    context.password = hashedPass;

    const rows = await register.register(context);

    res.status(200).json(rows);

  } catch (err) {
    next(err);
  }
}

module.exports.post = post;
