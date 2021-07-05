const inbox = require('../data/inbox.json');
const sent = require('../data/sent.json');
const trash = require('../data/trash.json');

const taggedInbox = inbox.map((email) => {
  email.mailbox = 'inbox';
  return email;
});

const taggedSent = sent.map((email) => {
  email.mailbox = 'sent';
  return email;
});

const taggedTrash = trash.map((email) => {
  email.mailbox = 'trash';
  return email;
});

const allEmail = [...taggedInbox, ...taggedSent, ...taggedTrash];

exports.getAll = async (req, res) => {
  const listMailboxes = [];
  allEmail.forEach((email) => {
    listMailboxes.push(email.mailbox);
  });
  const uniqueMailboxes = new Set(listMailboxes);

  const combined = [];
  uniqueMailboxes.forEach((mailbox) => {
    let returnMailbox = allEmail.filter((email) => {
      return email.mailbox === mailbox;
    });
    returnMailbox = removePropertyFromAll(returnMailbox, 'mailbox');
    returnMailbox = removePropertyFromAll(returnMailbox, 'content');
    combined.push({'name': mailbox, 'mail': returnMailbox});
  });

  if (req.query.mailbox) {
    let returnMailbox = allEmail.filter((email) => {
      return email.mailbox === req.query.mailbox;
    });
    returnMailbox = removePropertyFromAll(returnMailbox, 'mailbox');
    returnMailbox = removePropertyFromAll(returnMailbox, 'content');
    return res.status(200).json([{'name': req.query.mailbox,
      'mail': returnMailbox}]);
  }
  res.status(200).json(combined);
};

exports.getOne = async (req, res) => {
  const id = req.params.id;
  const matchingEmail = allEmail.find((email) => {
    return email.id === id;
  });
  if (matchingEmail) {
    return res.status(200).json(removeProperty(matchingEmail, 'mailbox'));
  } else {
    return res.send(404);
  }
};

exports.post = async (req, res) => {
  const newEmail = req.body;
  newEmail['from-email'] = sent[0]['from-email'];
  newEmail['from-name'] = sent[0]['from-name'];
  newEmail['id'] = uuidv4();
  newEmail.mailbox = 'sent';
  allEmail.push(newEmail);
  return res.status(201).json(removeProperty(newEmail, 'mailbox'));
};

exports.put = async (req, res) => {
  const matchingEmail = allEmail.find((email) => {
    return email.id === req.params.id;
  });
  if (req.query.mailbox === 'sent' &&
  matchingEmail.mailbox !== 'sent') {
    return res.send(409);
  }
  if (matchingEmail) {
    matchingEmail.mailbox = req.query.mailbox;
    return res.send(204);
  } else {
    return res.send(404);
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

/**
 * From https://stackoverflow.com/questions/105034/
 * how-to-create-a-guid-uuid/2117523#2117523
 * @return {string} UUID
 */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
