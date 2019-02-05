var express = require('express');
var app = express();
var fs = require("fs");
var _ = require("underscore");

const https = require('https');
const http = require('http');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var sa_token = 'Bearer '+process.env["SA_TOKEN"];
var os_console_host = process.env["OS_CONSOLE_HOST"];
var os_console_port = process.env["OS_CONSOLE_PORT"];
var options;

//Todo ability to check that role that role has correct access to required resources
//Key pair lookup with ei [{"pods":"get"},{"pods":"list"},{"pods":"watch"}] - Resource pods and verbs get,list,watch
var required_role_resources = process.env["REQUIRED_ROLE_RESOURCES"];

//Enterprise version should have ability to use https://console.example.com:8443/apis/user.openshift.io/v1/groups
//This will help intergrate LDAP and other system wide group authorization
//oc adm policy who-can get groups
//CLI command = oc get groups -o json --loglevel=9
//oc create clusterrole cluster-group-reader --verb=get,list,watch --resource=groups.user.openshift.io
//The following user and/or group and/or serviceaccount can be set
//oc create clusterrolebinding cluster-group-reader --clusterrole=cluster-group-reader --user=foo@bar.com --group=bargroup --serviceaccount=foosa
//Test by using user/group/sa token
//oc get groups -o json --loglevel=9 --token=<token>

function setOptions(namespace,sa_token){
    options = {
        headers: {
            'Accept': 'application/json',
            'Authorization': sa_token
        },
    hostname: os_console_host,
    port: os_console_port,
    path: `/apis/authorization.openshift.io/v1/namespaces/${namespace}/rolebindings/`,
    method: 'GET'
    };
};

app.get('/', function (req, res) {
  if (! req.accepts('json')) {
    res.status(400).send('Header "Accept" must be set to application/json.');
    return;
  }
  var subject = req.headers['x-subject'];
  var group = req.headers['x-subject-group'];
  var sa_token = req.headers['authorization'];
  if(req.headers['x-subject']){
    var namespace = req.headers['x-namespace'];
    setOptions(namespace,sa_token);
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
                var authorized = false;
                try {
                    const data = JSON.parse(body);
                    _.each(data.items,(value, key, list) => {
                        //value.groupNames
                        if(value.userNames){
                            if(_.contains(value.userNames,subject) && (_.contains(value.groupNames,group) || ! group ) ){                                
                                authorized = true;
                            }
                        }
                    }
                )
                if(authorized){
                    res.status(200).send('ok');
                }
                else{
                    res.status(401).send('User and/or Group not authorized.');
                }
                } catch (er) {
                //   // uh oh! bad json!
                    res.statusCode = 400;
                    return res.end(`error: ${er.message}`);
                    console.error('er: ', er);
                }
            });
            
        }
        else{
            res.status(resInternal.statusCode).end(`Message: ${resInternal.statusMessage}`);
            // console.error("statusCode: ", resInternal.statusCode); // <======= Here's the status code
            // console.error("headers: ", resInternal.headers);
        }
        }).on('error', (e) => {
        console.error(e);
        });
  }
  else{
        res.status(400).end(`Message: Header variable 'X-Subject' is undefined.`);
  }
});


var server = app.listen(8080, function () {
  console.log('App listening on port 8080.');
});

module.exports = server;
