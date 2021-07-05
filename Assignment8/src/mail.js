const db = require('./db');
// regular expression from:
// stackoverflow.com/questions/136505/searching-for-uuids-in-text-with-regex
const re =
/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;

exports.getAll = async (req, res) => {
  let emails;
  if (req.query.from) {
    emails = await db.findEmailsFrom(req.query.from);
    // return res.status(200).json(emails);
  } else {
    emails = await db.selectEmails(req.query.mailbox);
  }
  if (emails.length === 0 && req.query.mailbox) {
    return res.send(404);
  }
  const listMailboxes = [];
  emails.forEach((email) => {
    listMailboxes.push(email.mailbox);
  });
  const uniqueMailboxes = new Set(listMailboxes);
  const combined = [];
  uniqueMailboxes.forEach((mailbox) => {
    let returnMailbox = emails.filter((email) => {
      return email.mailbox === mailbox;
    });
    returnMailbox = removePropertyFromAll(returnMailbox, 'mailbox');
    returnMailbox = removePropertyFromAll(returnMailbox, 'content');
    combined.push({'name': mailbox, 'mail': returnMailbox});
  });

  res.status(200).json(combined);
};

exports.getByID = async (req, res) => {
  const validUUID = validateUUID(req.params.id);
  if (!validUUID) {
    return res.send(400);
  }
  const email = await db.selectEmail(req.params.id);
  if (email) {
    return res.status(200).json(email);
  } else {
    res.status(404).send();
  }
};

exports.post = async (req, res) => {
  const newEmailContent = req.body;
  // const email = await db.selectEmail(req.body.id);
  // if (email) {
  //   res.status(409).send();
  // } else {
  if (!req.body.to.name || !req.body.to.email) {
    return res.send(400);
  }
  const date = new Date();
  newEmailContent.from =
    {'name': 'CSE183 Student', 'email': 'cse183student@ucsc.edu'};
  newEmailContent.sent = date.toISOString();
  newEmailContent.received = date.toISOString();
  const returnId = await db.insertEmail(req.body);
  // const returnEmail = await db.insertEmail(req.body);
  const returnEmail = await db.selectEmail(returnId);
  res.status(201).send(returnEmail);
// }
};

exports.put = async (req, res) => {
  const id = req.params.id;
  const mailbox = req.query.mailbox;
  const validUUID = validateUUID(id);
  if (!validUUID) {
    return res.send(400);
  }
  const email = await db.selectEmailWithMailbox(id);
  if (email) {
    if (email.mailbox !== 'sent' && mailbox === 'sent') {
      return res.send(409);
    }
    await db.updateEmail(mailbox, id);
    return res.send(204);
  } else {
    res.send(404);
  }
};

const removePropertyFromAll = (mailbox, property) => {
  const formattedMailbox = mailbox.map((email) => {
    return removeProperty(email, property);
  });
  return formattedMailbox;
};

const removeProperty = (email, property) => {
  const emailCopy = Object.assign({}, email);
  delete emailCopy[property];
  return emailCopy;
};

const validateUUID = (uuid) => {
  const result = re.test(uuid);
  return result;
};
