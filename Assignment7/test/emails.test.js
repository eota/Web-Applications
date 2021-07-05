const supertest = require('supertest');
const http = require('http');

const app = require('../src/app');

let server;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
});

afterAll((done) => {
  server.close(done);
});

test('GET Invalid URL', async () => {
  await request.get('/v0/emailz/')
    .expect(404)
});

test('GET All', async () => {
  await request.get('/v0/mail')
    .expect(200)
    .expect('Content-Type', /json/)
    .then(data => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body[0]).toBeDefined();
    //   expect(data.body.books).toBeDefined();
      expect(data.body[0].mail.length).toEqual(100);
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

test('GET One', async () => {
  await request.get('/v0/mail/591b428e-1b99-4a56-b653-dab17210b3b7')
    .expect(200)
    .expect('Content-Type', /json/)
    .then(data => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.id).toBeDefined();
      expect(data.body.id).toEqual('591b428e-1b99-4a56-b653-dab17210b3b7');
      // expect(data.body.author).toEqual('Zelig Nizet');
      // expect(data.body.title).toEqual('Across the Bridge');
      // expect(data.body.publisher).toEqual('HarrisMcDermott');
    })
});

test('GET One missing', async () => {
  await request.get('/v0/mail/591b428e-1b99-4a56-b653-dab17210e3c7')
    .expect(404)
});

test('GET Missing', async () => {
  await request.get('/v0/books/591b428e-1b99-4a56-b653-dab17210e3e7')
    .expect(404)
});

// test('GET Invalid ISBN ', async () => {
//   await request.get('/v0/books/4987331178-1')
//     .expect(400)
// });

const email = {
  "to-name": "bob",
  "to-email": "bob@gmail.com",
  "subject": "hi",
  "received": "10/4/19",
  "content": "this is my email hi"
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
      expect(data.body['to-name']).toEqual(email['to-name']);
      // expect(data.body.author).toEqual(book.author);
      // expect(data.body.title).toEqual(book.title);
      // expect(data.body.publisher).toEqual(book.publisher);
    })
});

test('GET After POST', async () => {
  await request.get('/v0/mail/' + id)
    .expect(200)
    .then(data => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.id).toBeDefined();
      expect(data.body.id).toEqual(id);
      // expect(data.body.author).toEqual(book.author);
      // expect(data.body.title).toEqual(book.title);
      // expect(data.body.publisher).toEqual(book.publisher);
    })
});

test('PUT', async () => {
  await request.put('/v0/mail/' + id + '?mailbox=trash')
  .expect(204)
});

test('PUT un-sent email to sent mailbox', async () => {
  await request.put('/v0/mail/' + 'df49393d-1dc1-416c-bf71-f7cf7a1a1ec5'
  + '?mailbox=sent')
  .expect(409)
});

test('PUT id doesnt exist', async () => {
  await request.put('/v0/mail/' + '591b428e-1b99-4a56-b653-dab17210e3c7'
   + '?mailbox=trash')
  .expect(404)
});

test('PUT missing query param', async () => {
  await request.put('/v0/mail/' + '591b428e-1b99-4a56-b653-dab17210e3c7'
   + '?mailbox=trash')
  .expect(404)
});

// test('POST Invalid ISBN', async () => {
//   book.isbn = 'some-old-guff';
//   await request.post('/v0/books/')
//     .send(book)
//     .expect(400)
// });

// test('POST Exisiting ISBN', async () => {
//   book.isbn = '4987331179';
//   await request.post('/v0/books/')
//     .send(book)
//     .expect(409)
// });
