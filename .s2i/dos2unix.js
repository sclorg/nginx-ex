//Following is to convert all file in folder from dos format to unix.
//Is an issue with Theia where files are create in dos format
'use strict'
var fs = require('fs');
const dos2unix = require('ssp-dos2unix-js').dos2unix
 var dir = 'bin/';
 fs.readdir(dir, function(err, items) { 
    for (var i=0; i<items.length; i++) {
        var path = dir + items[i];
        fs.chmod(path, 0o660 , (err) => {
            if (err) throw err;
        });
        let converted = dos2unix(path, {feedback: true, writable: true});
        fs.chmod(path, 0o770 , (err) => {
            if (err) throw err;
        });
        // console.log(converted) // Returned text as string without any carriage returns (\r).
        // If you use writable as true, returns 0 instead of text.
        console.log(items[i] + " converted.");
    }
});
