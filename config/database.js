module.exports = {
  employeesPool: {
    user:           process.env.NODE_ORACLEDB_USER,
    password:       process.env.NODE_ORACLEDB_PASSWORD,
    connectString:  "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=146.6.167.223)(PORT=1521))(CONNECT_DATA=(SID=ORCL)))",
    poolMin:        0,
    poolMax:        10,
    poolIncrement:  0
  }
}
