const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.selectEmails = async (mailbox) => {
  let select = 'SELECT * FROM mail';
  if (mailbox) {
    select += ` WHERE mailbox ~* $1`;
  }
  const query = {
    text: select,
    values: mailbox ? [`${mailbox}`] : [],
  };
  const {rows} = await pool.query(query);
  const emails = [];
  for (const row of rows) {
    const email = row.mail;
    email['id'] = row.id;
    email['mailbox'] = row.mailbox;
    emails.push(email);
  }
  return emails;
};

exports.selectEmail = async (id) => {
  const select = 'SELECT * FROM mail WHERE id = $1';
  const query = {
    text: select,
    values: [id],
  };
  const {rows} = await pool.query(query);
  if (!rows[0]) {
    return undefined;
  }
  const email = rows[0].mail;
  email['id'] = rows[0].id;
  return email;
};

exports.findEmailsFrom = async (from) => {
  const select = 'SELECT * FROM mail WHERE mail->\'from\'->>LOWER(\'name\')' +
    ' ~* $1 OR mail->\'from\'->>LOWER(\'email\') = LOWER($1)';
  // const select = "SELECT * FROM mail WHERE mail->'from'->>'email' = $1";
  const query = {
    text: select,
    values: [from],
  };
  const {rows} = await pool.query(query);
  const emails = [];
  for (const row of rows) {
    const email = row.mail;
    email['id'] = row.id;
    email['mailbox'] = row.mailbox;
    emails.push(email);
  }
  return emails;
};

exports.selectEmailWithMailbox = async (id) => {
  const select = 'SELECT * FROM mail WHERE id = $1';
  const query = {
    text: select,
    values: [id],
  };
  const {rows} = await pool.query(query);
  return rows[0];
};

exports.insertEmail = async (mail) => {
  const insert = 'INSERT INTO mail(mailbox, mail) VALUES ($1, $2) RETURNING id';
  const query = {
    text: insert,
    values: ['sent', mail],
  };
  const id = await pool.query(query);
  return id.rows[0].id;
};

exports.updateEmail = async (mailbox, id) => {
  const update = 'UPDATE mail SET mailbox = $1 WHERE id = $2';
  const query = {
    text: update,
    values: [mailbox, id],
  };
  await pool.query(query);
};
