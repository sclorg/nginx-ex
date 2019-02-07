var request = require('supertest');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var sa_token = 'Bearer '+process.env["SA_TOKEN"];
var namespace = 'console';
var subject ='james@devcomb.com'
var host ='console.devcomb.com'
var port = '8443'

describe('Checking Authorization Backend Helper App:', function () {
  var server;
  beforeEach(function () {
    server = require('./index');
  });
  afterEach(function () {
    server.close();
  });
  it(`responds to / for user "${subject}" without group criteria`, function (done) {
    request(server)
        .get('/')
        .set('Accept','application/json')
        .set('Authorization', sa_token)
        .set('X-Subject', subject)
        .set('X-Subject-Group', ``)
        .set('X-Oauth-Host', host)
        .set('X-Oauth-Port', port)
        .set('X-Namespace', `${namespace}`)
        .expect(200, done);
  });
  it(`responds to / for user "${subject}" in group "developer"`, function (done) {
    request(server)
        .get('/')
        .set('Accept','application/json')
        .set('Authorization', sa_token)
        .set('X-Subject', subject)
        .set('X-Subject-Group', `developer`)
        .set('X-Oauth-Host', host)
        .set('X-Oauth-Port', port)
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
        .set('X-Oauth-Host', host)
        .set('X-Oauth-Port', port)
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
        .set('X-Oauth-Host', host)
        .set('X-Oauth-Port', port)
        .set('X-Namespace', `${namespace}`)
        .expect(400, done);
  });
  it('responds to / for unauthorized namespace', function (done) {
    request(server)
        .get('/')
        .set('Accept','application/json')
        .set('Authorization', sa_token)
        .set('X-Subject', subject)
        .set('X-Subject-Group', ``)
        .set('X-Oauth-Host', host)
        .set('X-Oauth-Port', port)
        .set('X-Namespace', `foobar_error_namespace`)
        .expect(403, done);
  });
  it(`responds to / for user "${subject}" with bad/unauthorized Service Account token.`, function (done) {
    request(server)
        .get('/')
        .set('Accept','application/json')
        .set('Authorization', `Bearer ThiswillfailServiceAccountToken`)
        .set('X-Subject', subject)
        .set('X-Subject-Group', ``)
        .set('X-Oauth-Host', host)
        .set('X-Oauth-Port', port)
        .set('X-Namespace', `${namespace}`)
        .expect(401, done);
  });
  it(`responds to / for wrong host`, function (done) {
    request(server)
        .get('/')
        .set('Accept','application/json')
        .set('Authorization', sa_token)
        .set('X-Subject', subject)
        .set('X-Subject-Group', ``)
        .set('X-Oauth-Host', "badhost.address123444322.commer")
        .set('X-Oauth-Port', port)
        .set('X-Namespace', `${namespace}`)
        .expect(404, done);
  });
  it(`responds to / for wrong port`, function (done) {
    request(server)
        .get('/')
        .set('Accept','application/json')
        .set('Authorization', sa_token)
        .set('X-Subject', subject)
        .set('X-Subject-Group', ``)
        .set('X-Oauth-Host', host)
        .set('X-Oauth-Port', '1')
        .set('X-Namespace', `${namespace}`)
        .expect(403, done);
  });
  it('responds to / for bad "Accept" header variable not set to "json"', function (done) {
    request(server)
        .get('/')
        .set('Accept','foo/bar')
        .set('Authorization', sa_token)
        .set('X-Subject', subject)
        .set('X-Subject-Group', ``)
        .set('X-Oauth-Host', host)
        .set('X-Oauth-Port', port)
        .set('X-Namespace', `${namespace}`)
        .expect(400, done);
  });
  it(`responds to / for none of required headers set.`, function (done) {
    request(server)
        .get('/')
        .set('Accept','application/json')
        .set('X-Subject-Group', `not required`)
        .expect(400, done);
  });
  it('404 everything else', function (done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});