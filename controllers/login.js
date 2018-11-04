const crypto = require('crypto');
const login = require('../db_apis/login.js');

async function post(req, res, next) {
  try {
    hashedPass = crypto.createHash('sha256').update(req.body.password).digest('hex');

    const context = {
      username: req.body.username,
    };

    const rows = await login.attemptLogin(context);
    
    if (req.body.username) {
      if (rows.length === 1) {
        if (rows[0].PASSWORD === hashedPass) {
          console.log(`\nSuccessful login from ${context.username}\n`);
          res.status(200).json(rows[0]);
        } else {
          res.status(404).end();
        }
      } else {
        res.status(404).end();
      }
    } else {
      res.status(200).json(rows);
    }
  } catch (err) {
    next(err);
  }
}

module.exports.post = post;
