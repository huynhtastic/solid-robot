const database = require('../services/database.js');

const baseQuery = 
  `SELECT emp_id "emp_id",
    username "username",
    first_name "first_name",
    last_name "last_name",
    email "email",
    manager_id "manager_id"
  from Employees`;

async function find(context) {
  let query = baseQuery;
  const binds = {};

  if (context.id) {
    binds.emp_id = context.id;

    query += `\nwhere emp_id = :emp_id`;
  }

  console.log(query);
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.find = find;
