const oracledb = require('oracledb');
const dbConfig = require('../config/database.js');

async function initialize() {
  const pool = await oracledb.createPool(dbConfig.employeesPool);
}

async function close() {
  await oracledb.getPool().close();
}

async function simpleExecute(statement, binds = [], opts = {}) {
  return new Promise(async (resolve, reject) => {
    let conn;

    opts.outFormat = oracledb.OBJECT;
    opts.autoCommit = true;

    try {
      conn = await oracledb.getConnection();
      console.log(statement);
      const result = await conn.execute(statement, binds, opts);

      resolve(result);
    } catch (err) { 
      reject(err);
    } finally {
      if (conn) { // conn worked, need to close
        try {
          await conn.close();
        } catch (err) {
          console.log(err);
        }
      }
    }
  });
}

module.exports.initalize = initialize;
module.exports.close = close;
module.exports.simpleExecute = simpleExecute;
