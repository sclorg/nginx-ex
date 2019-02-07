var express = require('express');
var app = express();
var fs = require("fs");
var _ = require("underscore");

const https = require('https');
const http = require('http');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

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

function setOptions(headersObj){
    return options = {
        headers: {
            'Accept': 'application/json',
            'Authorization': headersObj.sa_token
        },
        timeout: 100,
        hostname: headersObj.os_console_host,
        port: headersObj.os_console_port,
        path: `/apis/authorization.openshift.io/v1/namespaces/${headersObj.namespace}/rolebindings/`,
        method: 'GET'
    };
    
};

app.get('/', function (req, res) {
    if (! req.accepts('json')) {
        res.status(400).send('Header "Accept" must be set to application/json.');
        return;
    }
    var headers = { 
        os_console_host: req.headers['x-oauth-host'],
        os_console_port: req.headers['x-oauth-port'],
        subject: req.headers['x-subject'],
        group: req.headers['x-subject-group'],
        sa_token: req.headers['authorization'],
        namespace: req.headers['x-namespace']
    };
    // console.log("statusCode: ", req.statusCode); // <======= Here's the status code
    // console.log("headers: ", req.headers);

    if(checkHeaders(headers,res)){
        var options = setOptions(headers);
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
                            if(value.userNames){
                                if(_.contains(value.userNames,headers.subject) && (_.contains(value.groupNames,headers.group) || ! headers.group ) ){                                
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
                        console.error('er: ', er);
                        res.statusCode = 400;
                        res.end(`error: ${er.message}`);
                    }
                });
                resInternal.on('socket', function (socket) {
                    socket.setTimeout(100);  
                    socket.on('timeout', function() {
                        resInternal.abort();
                    });
                });                
            }
            else{
                res.status(resInternal.statusCode).end(`Message: ${resInternal.statusMessage}`);
                // console.error("statusCode: ", resInternal.statusCode); // <======= Here's the status code
                // console.error("headers: ", resInternal.headers);
            }
            }).on('error', (e) => {
                if(e.code === 'ENOTFOUND'){
                    res.statusCode = 404;
                }
                res.end(`Error: ${e.message}`);
            });
    }
});


function checkHeaders(headers,res){
    var headersSet = true;
    var badkeys={};
    for(key in headers){
        //Checks if headers are empty or contain no values
        if((headers[key] === "" || ! headers[key] )  && ! (key === "group") ){
            headersSet = false;
            badkeys[key] = headers[key];
        }
    }
    if(!headersSet){
        res.statusCode = 400;
        var keysStr='';
        for(key in badkeys){
            keysStr=keysStr+key+",";
        }
        keysStr = keysStr.slice(0, -1);
        res.end(`Message: Header variable(s) '${keysStr}' is undefined.`);
    }
    return headersSet;
}

var server = app.listen(8080, function () {
  console.log('App listening on port 8080.');
});

module.exports = server;
