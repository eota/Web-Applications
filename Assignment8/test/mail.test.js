const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../src/app');

let server;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  return db.reset();
});

afterAll((done) => {
  server.close(done);
});

test('GET Invalid URL', async () => {
  await request.get('/v0/so-not-a-real-end-point-ba-bip-de-doo-da/')
    .expect(404);
});

test('GET All', async () => {
  await request.get('/v0/mail')
    .expect(200)
    .expect('Content-Type', /json/)
    .then(data => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body[0]).toBeDefined();
      expect(data.body[0].mail.length).toEqual(100);
      expect(data.body[0].name).toEqual('sent');
      expect(data.body[1].name).toEqual('inbox');
      expect(data.body[2].name).toEqual('trash');
    })
});

test('GET Mailbox', async () => {
  await request.get('/v0/mail?mailbox=inbox')
    .expect(200)
    .expect('Content-Type', /json/)
    .then(data => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body[0].name).toEqual('inbox');
    })
});

test('GET Mailbox does not exist', async () => {
  await request.get('/v0/mail?mailbox=wew123')
    .expect(404)
});

let getFromId;

test('GET from', async () => {
  await request.get('/v0/mail?from=wand')
    .expect(200)
    .expect('Content-Type', /json/)
    .then(data => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.length).toEqual(2);
      expect(data.body[0].name).toEqual('inbox');
      expect(data.body[1].name).toEqual('trash');
      getFromId = data.body[0].mail[0].id;
    })
});

test('GET One', async () => {
  await request.get('/v0/mail/' + getFromId)
    .expect(200)
    .expect('Content-Type', /json/)
    .then(data => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.id).toBeDefined();
      expect(data.body.id).toEqual(getFromId);
    })
});

test('GET One invalid id', async () => {
  await request.get('/v0/mail/' + 'abc123')
    .expect(400)
});

test('GET One missing', async () => {
  await request.get('/v0/mail/591b428e-1b99-4a56-b653-dab17210e3c7')
    .expect(404)
});

const email = {
  "to": {"name":"Jimbo Jumbo", "email":"jimbojumbo@yahoo.com"},
  "subject": "hi",
  "content": "this is my email hi",
};
let id;

test('POST New', async () => {
  await request.post('/v0/mail/')
    .send(email)
    .expect(201)
    .then(data => {
      id = data.body.id;
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.id).toBeDefined();
      expect(data.body.to).toEqual(email['to']);
      expect(data.body.subject).toEqual('hi');
      expect(data.body.content).toEqual('this is my email hi');

    })
});

const emailUnexpectedProperties = {
  "to": {"name":"Big Oop", "email":"oop@yahoo.com"},
  "woops": "123",
};

test('POST with unexpected properties', async () => {
  await request.post('/v0/mail/')
    .send(emailUnexpectedProperties)
    .expect(400)
});

const emailUnexpectedProperties2 = {
  "to": {"person":"Big Oop", "account":"oop@yahoo.com"},
  "subject": "hi",
  "content": "this is my email hi",
};

test('POST with incorrect "to" format', async () => {
  await request.post('/v0/mail/')
    .send(emailUnexpectedProperties2)
    .expect(400)
});

test('GET After POST', async () => {
  await request.get('/v0/mail/' + id)
    .expect(200)
    .then(data => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.id).toBeDefined();
      expect(data.body.id).toEqual(id);
    })
});

test('PUT', async () => {
  await request.put('/v0/mail/' + id + '?mailbox=trash')
  .expect(204)
});

test('PUT invalid id', async () => {
  await request.put('/v0/mail/' + 'abc123' + '?mailbox=trash')
  .expect(400)
});


test('PUT un-sent email to sent mailbox', async () => {
  await request.put('/v0/mail/' + id + '?mailbox=sent')
  .expect(409)
});

test('PUT email doesnt exist', async () => {
  await request.put('/v0/mail/' + '591b428e-1b99-4a56-b653-dab17210e3c7'
   + '?mailbox=trash')
  .expect(404)
});
