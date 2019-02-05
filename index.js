var express = require('express');
var app = express();
var fs = require("fs");
var _ = require("underscore");

const https = require('https');
const http = require('http');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var role_binding = process.env["ROLE_BINDING"];
var sa_token = process.env["SA_TOKEN"];
var os_console_host = process.env["OS_CONSOLE_HOST"];
var os_console_port = process.env["OS_CONSOLE_PORT"];
var namespace = process.env["NAMESPACE"];

//Todo ability to check that role that role has correct access to required resources
//Key pair lookup with ei [{"pods":"get"},{"pods":"list"},{"pods":"watch"}] - Resource pods and verbs get,list,watch
var required_role_resources = process.env["REQUIRED_ROLE_RESOURCES"];


var options = {
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${sa_token}`
    },
  hostname: os_console_host,
  port: os_console_port,
  path: `/apis/authorization.openshift.io/v1/namespaces/${namespace}/rolebindings/${role_binding}`,
  method: 'GET'
};

app.get('/', function (req, res) {
  res.status(200).send('ok');
});

app.get('/test/', function (req, res) {
  var subject = req.headers['x-subject'];
  var group = req.headers['x-subject-group'];
  
  if(req.headers['x-subject']){
    
    https.get(options, (resInternal) => {
        let body = '';
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
                    _.each(data.items,(value, key, list) => {
                        //value.groupNames
                        if(value.userNames){
                            if(_.contains(value.userNames,subject) && (_.contains(value.groupNames,group) || ! group ) ){
                                console.log('Found:', value.userNames);
                                console.log('Role:', value.roleRef.name);
                            }
                        }
                    }
                )
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
