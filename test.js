var request = require('supertest');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var sa_token = 'Bearer '+process.env["SA_TOKEN"];
var namespace = 'console';

describe('Checking Authorization Backend Helper App:', function () {
  var server;
  beforeEach(function () {
    server = require('./index');
  });
  afterEach(function () {
    server.close();
  });
  it('responds to / for user "james@devcomb.com" without group criteria', function (done) {
  request(server)
    .get('/')
    .set('Accept','application/json')
    .set('Authorization', sa_token)
    .set('X-Subject', `james@devcomb.com`)
    .set('X-Subject-Group', ``)
    .set('X-Namespace', `${namespace}`)
    .expect(200, done);
  });
  it('responds to / for user "james@devcomb.com" in group "developer"', function (done) {
  request(server)
    .get('/')
    .set('Accept','application/json')
    .set('Authorization', sa_token)
    .set('X-Subject', `james@devcomb.com`)
    .set('X-Subject-Group', `developer`)
    .set('X-Namespace', `${namespace}`)
    .expect(200, done);
  });
  it('responds to / for unauthorized user', function (done) {
  request(server)
    .get('/')
    .set('Accept','application/json')
    .set('Authorization', sa_token)
    .set('X-Subject', `foo@bar.com`)
    .set('X-Subject-Group', ``)
    .set('X-Namespace', `${namespace}`)
    .expect(401, done);
  });
  it('responds to / for user header variable not set', function (done) {
  request(server)
    .get('/')
    .set('Accept','application/json')
    .set('Authorization', sa_token)
    .set('X-Subject', ``)
    .set('X-Subject-Group', ``)
    .set('X-Namespace', `${namespace}`)
    .expect(400, done);
  });
  it('responds to / for unauthorized namespace', function (done) {
  request(server)
    .get('/')
    .set('Accept','application/json')
    .set('Authorization', sa_token)
    .set('X-Subject', `james@devcomb.com`)
    .set('X-Subject-Group', ``)
    .set('X-Namespace', `foobar_error_namespace`)
    .expect(403, done);
  });
  it('responds to / for user "james@devcomb.com" with bad/unauthorized Service Account token.', function (done) {
  request(server)
    .get('/')
    .set('Accept','application/json')
    .set('Authorization', `Bearer ThiswillfailServiceAccountToken`)
    .set('X-Subject', `james@devcomb.com`)
    .set('X-Subject-Group', ``)
    .set('X-Namespace', `${namespace}`)
    .expect(401, done);
  });
  it('responds to / for bad "Accept" header variable not set to "application/json"', function (done) {
  request(server)
    .get('/')
    .set('Accept','foo/bar')
    .set('Authorization', sa_token)
    .set('X-Subject', `james@devcomb.com`)
    .set('X-Subject-Group', ``)
    .set('X-Namespace', `${namespace}`)
    .expect(400, done);
  });
  it('404 everything else', function (done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});