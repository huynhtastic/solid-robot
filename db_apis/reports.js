const oracledb = require('oracledb');
const database = require('../services/database.js');

const reportOne =
  `
  SELECT Year, Month, username, gift, redeem,
    RANK() OVER (PARTITION BY Year, Month ORDER BY gift DESC) AS rank
  FROM (
    SELECT * FROM (
    SELECT EXTRACT(YEAR FROM TXN_DATE) Year, EXTRACT(MONTH FROM TXN_DATE) Month,
      username, nvl2(recipient_id, 'GIFT', 'REDEEM') Type, SUM(Amount) Amount
    FROM ktransactions k, employees e
    WHERE k.sender_id = e.emp_id
    GROUP BY EXTRACT(YEAR FROM TXN_DATE), EXTRACT(MONTH FROM TXN_DATE), username, nvl2(recipient_id, 'GIFT', 'REDEEM')
    ) PIVOT (
      SUM(Amount)
      FOR Type IN ('GIFT' AS Gift, 'REDEEM' AS Redeem)
    )
  )
  ORDER BY Year DESC, Month DESC, rank ASC
  `;
async function getReport(context) {
  let query;
  if (context.report_id === 1) {
    query = reportOne;
  }

  const result = await database.simpleExecute(query);
  console.log(result);

  return result.rows;
}

module.exports.getReport = getReport;
