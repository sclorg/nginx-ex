var request = require('supertest');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var external_auth_uri = process.env["EXTERNAL_AUTH_URI"];
if(! external_auth_uri){
    external_auth_uri = "https://nodejs-theia-development-oojlwfhjxphwxrls-console.devcomb.com";
}

var sa_token = 'Bearer '+process.env["SA_TOKEN"];
var namespace = 'console';
var subject ='james@devcomb.com'
var host ='console.devcomb.com'
var port = '8443'

//Todo - Unable to get external test to work everytime. 
//Might be an issue with Openshift Routes not updating in time as local test always work as expected.
describe('Checking Authorization Backend Helper App Through HTTPS Route Address:', function () {
  it(`responds to / for user "${subject}" without group criteria`, function (done) {
    request(external_auth_uri)
        .get('/')
        .set('Accept','application/json')
        .set('Authorization', sa_token)
        .set('X-Subject', subject)
        .set('X-Subject-Group', ``)
        //X-Oauth-Host and X-Oauth-Port may not be safe for authorizing server. Maybe check with white list to allow.
        .set('X-Oauth-Host', host)
        .set('X-Oauth-Port', port)
        .set('X-Namespace', `${namespace}`)
        .expect(200, done);
  });
});