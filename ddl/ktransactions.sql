CREATE SEQUENCE txn_id_seq
  MINVALUE 1
  MAXVALUE 99999999
  START WITH 1
  INCREMENT BY 1
;

CREATE TABLE KTransactions (
  txn_id NUMBER NOT NULL,
  sender_id NUMBER NOT NULL,
  recipient_id NUMBER,
  amount NUMBER NOT NULL,
  txn_date DATE NOT NULL,
  message VARCHAR(140),
  CONSTRAINT pk_ktransaction PRIMARY KEY (txn_id),
  CONSTRAINT fk_sender
    FOREIGN KEY (sender_id)
    REFERENCES Employees(emp_id),
  CONSTRAINT fk_recipient
    FOREIGN KEY (recipient_id)
    REFERENCES Employees(emp_id)
);

CREATE TABLE Employees (
  emp_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY,
  username VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(64) NOT NULL,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  email VARCHAR(20) UNIQUE NOT NULL,
  admin NUMBER(1) DEFAULT ON NULL 0,
  points_received NUMBER DEFAULT ON NULL 0,
  points_giveable NUMBER DEFAULT ON NULL 0,
  gift_cards NUMBER DEFAULT ON NULL 0,
  CONSTRAINT pk_employees PRIMARY KEY (emp_id)
);

CREATE TABLE LeftoverPoints (
    id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY,
    emp_id NUMBER NOT NULL,
    leftover_points NUMBER NOT NULL,
    leftover_date DATE NOT NULL,
    CONSTRAINT pk_leftoverpoints PRIMARY KEY (id),
    CONSTRAINT fk_empid FOREIGN KEY (emp_id) REFERENCES Employees(emp_id)
);

CREATE TRIGGER ktransactions_on_insert
  BEFORE INSERT ON Ktransactions
  FOR EACH ROW
BEGIN
  SELECT txn_id_seq.nextval
  INTO :new.txn_id
  FROM dual;
END;

CREATE OR REPLACE PROCEDURE giveKudos
( p_sender_id IN ktransactions.sender_id%type,
  p_recipient_username IN employees.username%type,
  p_amount IN ktransactions.amount%type,
  p_txn_date IN VARCHAR,
  p_message IN ktransactions.message%type
)
AS
  d_recipient_id NUMBER;
  d_sender_balance NUMBER;
  d_recipient_balance NUMBER;
BEGIN
  SELECT emp_id INTO d_recipient_id
  FROM Employees WHERE username = p_recipient_username;
  SELECT points_giveable - p_amount INTO d_sender_balance
  FROM Employees WHERE emp_id = p_sender_id;
  SELECT points_received + p_amount INTO d_recipient_balance
  FROM Employees WHERE emp_id = d_recipient_id;

  INSERT INTO ktransactions (sender_id, recipient_id, amount, txn_date, message)
  VALUES (p_sender_id, d_recipient_id, p_amount, TO_DATE(p_txn_date, 'YYYY-MM-DD HH24:MI:SS'), p_message);
  commit;

  UPDATE Employees
  SET points_giveable = d_sender_balance WHERE emp_id = p_sender_id;
  commit;

  UPDATE Employees
  SET points_received = d_recipient_balance WHERE emp_id = d_recipient_id;
  commit;
END giveKudos;

CREATE OR REPLACE PROCEDURE resetPoints
AS
BEGIN
    INSERT INTO leftoverpoints (emp_id, leftover_points, leftover_date)
    SELECT emp_id, points_giveable, sysdate FROM employees WHERE admin=0;
    commit;
    UPDATE Employees
    SET points_giveable = 1000
    WHERE admin=0;
    commit;
END resetPoints;

CREATE OR REPLACE PROCEDURE redeemGiftCard
( p_emp_id IN employees.emp_id%type )
AS
    d_balance NUMBER;
    d_gift_cards NUMBER;
BEGIN
    SELECT points_received, gift_cards INTO d_balance, d_gift_cards
    FROM Employees WHERE emp_id = p_emp_id;

    INSERT INTO ktransactions (sender_id, amount, txn_date, message)
    VALUES (p_emp_id, 10000, SYSDATE, 'GIFT CARD REDEMPTION');
    COMMIT;

    UPDATE Employees
    SET points_received = (d_balance - 10000), gift_cards = (d_gift_cards + 1)
    WHERE emp_id = p_emp_id;
    COMMIT;
END redeemGiftCard;

--Didn't work; insufficient privileges
BEGIN
    DBMS_SCHEDULER.CREATE_JOB (
        job_name => 'resetPoints',
        job_type => 'PLSQL_BLOCK',
        job_action => 'BEGIN resetPoints; END;',
        start_date => timestamp '2018-11-07 17:58:00',
        repeat_interval => 'FREQ=MINUTELY;INTERVAL=1;',
        enabled => TRUE);
END;
--Didn't work; insufficient privileges

DECLARE
X NUMBER;
BEGIN
    DBMS_JOB.SUBMIT (
        job => X,
        WHAT => 'BEGIN resetPoints; END;',
        next_date => SYSDATE + ((1/24) / 60),
        interval => 'SYSDATE + ((1/24) / 12)'
    );
END;

SELECT txn_id, sender_id, sender, recipient_id,
  e.username recipient,
  amount, txn_date, message
FROM(
SELECT txn_id,
  sender_id, e.username sender,
  recipient_id,
  amount, txn_date, message
FROM ktransactions k, employees e
WHERE k.sender_id = e.emp_id
) a LEFT OUTER JOIN employees e
ON a.recipient_id = e.emp_id
ORDER BY txn_date ASC;

-- Report 1
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
ORDER BY Year DESC, Month DESC, rank ASC;

-- Report 2
SELECT username, points_giveable
FROM employees
WHERE points_giveable !=0;

-- Report 3
SELECT EXTRACT(MONTH FROM txn_date) Month, username, COUNT(txn_id) Redemption_Count
FROM ktransactions k, employees e
WHERE k.sender_id = e.emp_id AND recipient_id IS NULL
AND EXTRACT(MONTH FROM txn_date) IN (EXTRACT(MONTH FROM SYSDATE), EXTRACT(MONTH FROM ADD_MONTHS(SYSDATE, -1)), EXTRACT(MONTH FROM ADD_MONTHS(SYSDATE, -2)))
GROUP BY EXTRACT(MONTH FROM txn_date), username;
