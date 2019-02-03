var express = require('express');
var app = express();
var fs = require("fs");
var _ = require("underscore");

const https = require('https');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var role_binding = process.env["ROLE_BINDING"];
var sa_token = process.env["SA_TOKEN"];


const options = {
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${sa_token}`
    },
  hostname: 'console.devcomb.com',
  port: 8443,
  path: `/apis/authorization.openshift.io/v1/namespaces/console/rolebindings/${role_binding}`,
  method: 'GET'
};

https.get(options, (res) => {
  //console.log('statusCode:', res.statusCode);
  //console.log('headers:', res.headers);
  let body = '';
  console.log("statusCode: ", res.statusCode); // <======= Here's the status code
  console.log("headers: ", res.headers);
  if(res.statusCode==200){
    res.on('data', (chunk) => {
        try {
            body += chunk;
        } catch(err) {
            console.error(err)
        }
    });
    res.on('end', () => {
        try {
        const data = JSON.parse(body);
        if(_.contains(_.allKeys(data),"subjects") ){
            console.log('body:', body);
            var list = _.where(data.subjects, {name: "james@devcomb.com"});
            console.log('list: ', list);
        }
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
    console.error("statusCode: ", res.statusCode); // <======= Here's the status code
    console.error("headers: ", res.headers);
  }
}).on('error', (e) => {
  console.error(e);
});

// app.get('/', function (req, res) {
//   res.send('Hello');
// });
// app.listen(8080, function () {

//   try {
//     var str = fs.readFileSync("test.json");
//     //var str = '{ "name": "John Doe", "age": 42 }';
//     var obj = JSON.parse(str);
//   } catch(err) {
//     console.error(err)
//   }
//   console.log('Example app listening on port 8080!');
//   console.log('obj.apiVersion'+obj.apiVersion);
// });