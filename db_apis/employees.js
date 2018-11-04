const oracledb = require('oracledb');
const database = require('../services/database.js');

const baseQuery = 
  `SELECT username, first_name, last_name
   FROM Employees
   WHERE emp_id != :emp_id AND admin = 0`;

async function findGiveables(context) {
  let query = baseQuery;
  const binds = context;

  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.findGiveables = findGiveables;

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

const createSql = 
  `insert into employees (
    username,
    password,
    first_name,
    last_name,
    email,
    manager_id
   ) values (
    :username,
    :password,
    :first_name,
    :last_name,
    :email,
    :manager_id
   ) returning emp_id
   into :emp_id`;

async function create(emp) {
  const employee = Object.assign({}, emp)  // shallow copy

  employee.emp_id = {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER
  }

  const result = await database.simpleExecute(createSql, employee);

  employee.employee_id = result.outBinds.emp_id[0];

  return employee;
}

module.exports.create = create;

const updateSql = 
  `UPDATE employees
     SET `

const whereUpdateSql =
  `\nWHERE emp_id = :emp_id`;

async function update(emp) {
  const employee = Object.assign({}, emp);

  var completeUpdateSql = updateSql;
  for (let [key, value] of Object.entries(employee)) {
    if (value) {
      console.log(value);
      completeUpdateSql += `\n${key} = :${key},`;
    } else {
      delete employee[key];
    } 
  }
  if (completeUpdateSql[completeUpdateSql.length-1].localeCompare(',') === 0) {
    completeUpdateSql = completeUpdateSql.slice(0, -1);
  }
  completeUpdateSql += whereUpdateSql;

  const result = await database.simpleExecute(completeUpdateSql, employee);

  if (result.rowsAffected && result.rowsAffected === 1) {
    return employee;
  } else {
    return null;
  }
}

module.exports.update = update;

const deleteSql =
 `begin
 
    delete from employees
    where emp_id = :emp_id;
 
    :rowcount := sql%rowcount;
 
  end;`
 
async function del(id) {
  const binds = {
    emp_id: id,
    rowcount: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER
    }
  }
  const result = await database.simpleExecute(deleteSql, binds);
 
  return result.outBinds.rowcount === 1;
}
 
module.exports.delete = del;
