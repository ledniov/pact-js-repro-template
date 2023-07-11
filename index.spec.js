const { Matchers, Pact} = require("@pact-foundation/pact");
const { term } = require("@pact-foundation/pact/src/dsl/matchers");
const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const { expect } = chai;
chai.use(chaiHttp);
let provider;
const dynamicUUID = uuidv4(); // Generate a dynamic UUID
const dynamicPath =  term({ matcher: '.*', generate: '/anyguuuid' });

beforeAll(async () => {
  jest.setTimeout(120000);
  provider = new Pact({
    consumer: 'proxy-api-secret-store-get',
    provider: 'secret-store-for-proxy-api-get',
    port: 5000,
    log: path.resolve('logs', 'pact.log'),
    dir: path.resolve('pacts'),
    logLevel: 'debug',
    pactfileWriteMode: 'overwrite'
  });
  await provider.setup();
});
beforeEach(() => {
  return provider.addInteraction({
    state: 'I get credentials',
    uponReceiving: 'A Request for obtaining credentials',
    withRequest: {
      method: 'GET',
      path: dynamicPath,
      headers: {
        'Content-Type': 'application/json',
      }
    },
    willRespondWith: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body:  {
        id: Matchers.term({
          generate: "4f2fa219-c805-4781-937c-bf3296e93cc4",
          matcher: '.*'
        }),
        details: Matchers.term({
          generate: "some string",
          matcher: '.*'
        }),
      },
    },
  });
});
it('Gets Credentials from Secret Store and Returns 200', (done) => {
  chai
    .request("http://127.0.0.1:5000")
    .get('/'+dynamicUUID)
    .set('Content-Type', 'application/json')
    .end((err, res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({"id": "4f2fa219-c805-4781-937c-bf3296e93cc4", "details": "some string"})
      done();
    });
});
afterEach(() => {
  return provider.verify();
});
afterAll(async () => {
  await provider.finalize();
});