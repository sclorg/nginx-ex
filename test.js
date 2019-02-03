var request = require('supertest');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var role_binding = process.env["ROLE_BINDING"];
var sa_token = process.env["SA_TOKEN"];

describe('loading express', function () {
  var server;
  beforeEach(function () {
    server = require('./index');
  });
  afterEach(function () {
    server.close();
  });
  it('responds to /', function testSlash(done) {
  request(server)
    .get('/')
    .expect(200, done);
  });
  it('responds to /test/', function testSlash(done) {
  request(server)
    .get('/test/')
    .set('Accept','application/json')
    .set('Authorization', `Bearer ${sa_token}`)
    .set('X-Subject', `james@devcomb.com`)
    .expect(200, done);
  });
  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});