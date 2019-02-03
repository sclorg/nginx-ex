var express = require('express');
var app = express();
var fs = require("fs");
var _ = require("underscore");

const https = require('https');
const http = require('http');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var role_binding = process.env["ROLE_BINDING"];
var sa_token = process.env["SA_TOKEN"];


var options = {
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${sa_token}`
    },
  hostname: 'console.devcomb.com',
  port: 8443,
  path: `/apis/authorization.openshift.io/v1/namespaces/console/rolebindings/${role_binding}`,
  method: 'GET'
};

app.get('/', function (req, res) {
  res.status(200).send('ok');
});

app.get('/test/', function (req, res) {
  if(req.headers['x-subject']){
    https.get(options, (resInternal) => {
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        let body = '';
        console.log("statusCode: ", resInternal.statusCode); // <======= Here's the status code
        console.log("headers: ", resInternal.headers);
        if(resInternal.statusCode==200){
            resInternal.on('data', (chunk) => {
                try {
                    body += chunk;
                } catch(err) {
                    console.error(err)
                }
            });
            resInternal.on('end', () => {
                try {
                const data = JSON.parse(body);
                if(_.contains(_.allKeys(data),"subjects") ){
                    console.log('body:', body);
                    var list = _.where(data.subjects, {name: req.headers['x-subject']});
                    console.log('list: ', list);
                }
                res.status(200).send('ok');
                // write back something interesting to the user:
                //   res.write(typeof data);
                //   res.end();
                } catch (er) {
                //   // uh oh! bad json!
                //   res.statusCode = 400;
                //   return res.end(`error: ${er.message}`);
                    console.error('er: ', er);
                }
            });
        }
        else{
            console.error("statusCode: ", resInternal.statusCode); // <======= Here's the status code
            console.error("headers: ", resInternal.headers);
        }
        }).on('error', (e) => {
        console.error(e);
        });
  }
});


var server = app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

module.exports = server;

// const optionsTest = {
//     headers: {
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${sa_token}`,
//         'X-Subject': `james@devcomb.com`
//     },
//   hostname: '0.0.0.0',
//   port: 8080,
//   path: `/`,
//   method: 'GET'
// };

// http.get(optionsTest, (res) => {
//     let body = '';
//     console.log("statusCode: ", res.statusCode);
//     console.log("headers: ", res.headers);
//     if(res.statusCode==200){
//         res.on('data', (chunk) => {
//             try {
//                 body += chunk;
//             } catch(err) {
//                 console.error(err)
//             }
//         });
//         res.on('end', () => {
//             console.log('body:', body);
//         });
//     }
//     else{
//         console.error("statusCode: ", res.statusCode);
//         console.error("headers: ", res.headers);
//     }
// }).on('error', (e) => {
//     console.error(e);
// });




