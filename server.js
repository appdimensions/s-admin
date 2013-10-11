/*
 * @preserve S-Admin
 * @author Lukas Rossi
 * @website www.appdimensions.com
 * @copyright 2013 Lukas Rossi
 * @license MIT license
 */

var http = require("http");
var fs = require("fs");
var mime = require("mime");
var querystring = require("querystring");

http.createServer(function(req, res){
    // Add slash to end of req.url //
    if(req.url.indexOf('.') === -1 && req.url.substr(req.url.length-1) !== '/'){
        req.url = req.url + '/';
    }
    
    // Administrator page management functions //
    
    // Main administrator page //
    if(req.url === "/admin/admin.html"){
        cookieAndDBMatch(function(err, result){
            if(!err && parseInt(result[0].ct) !== 0){
                loadFile('/admin/admin.html', res);
            }else{
                res.writeHead(302, {'Location': '/admin/index.html'});
                res.end();
            }
        }, req);
        return;
    }
    
    // Log in page //
    if(req.url === "/admin/"){
        /* Not implemented: Delete old tokens from the
         * database after a specified period of time
         * in case the user does not log out.
         */
        cookieAndDBMatch(function(err, result){
            if(!err && parseInt(result[0].ct) !== 0){
                res.writeHead(302, {'Location': '/admin/admin.html'});
                res.end();
            }else{
                res.writeHead(302, {'Location': '/admin/index.html'});
                res.end();
            }
        }, req);
        return;
    }
    
    // - - ADD YOUR CUSTOM SERVER-SIDE CODE WITHIN THIS AREA - - //
    
    /* Example:
    if(req.url === "/admin/YOUR-URL"){
        cookieAndDBMatch(function(err, result){
            if(!err && parseInt(result[0].ct) !== 0){
                
                // USER IS AUTHENTICATED //
                
            }else{
                res.writeHead(302, {'Location': '/admin/index.html'});
                res.end();
            }
        }, req);
        return;
    }*/
    
    // - - ADD YOUR CUSTOM SERVER-SIDE CODE WITHIN THE PRECEDING AREA - - //
    
    // Log in //
    if(req.url === "/admin/submit/"){
        var connection = null;
        if (req.method == 'POST') {
            var body = '';
            req.on('data', function (data) {
                body += data;
                if (body.length > 1e6) {//Prevent a brute-force attack
                    body = "";
                    res.writeHead(413, {'Content-Type': 'text/plain'}).end();
                    req.connection.destroy();
                }
            });
            req.on('end', function() {     
                var POST = querystring.parse(body);
                var page = require("./credentials");
                var credentials = page.credentials;
                var loggedIn = false;
                for(var i=0; i< credentials.length; i++){
                    if(POST['username'] === credentials[i].username && POST['pw'] === credentials[i].password){
                        loggedIn = true;
                        break;
                    }
                }
                
                if(loggedIn){
                    var token = '';
                    require('crypto').randomBytes(48, function(ex, buf) {
                        token = buf.toString('hex');
                        connection = mySQLConnection();
                        /* For added security, the browser info (req.headers['user-agent']) can be stored in
                         * the database, then that string can be compared with the current browser string
                         * to help ensure that the cookie was not transferred to another computer.
                         */
                        connection.query("INSERT INTO tokens (token) VALUES ('" + token + "')", function(err, result){
                            if(err){
                                res.writeHead(302, {'Location': '/admin/index.html#error'});
                                res.end();
                            }else{
                                var now = new Date();
                                var time = now.getTime();
                                time += 3600 * 1000;
                                now.setTime(time);
                                res.writeHead(302, {'Location': '/admin/', 'Set-Cookie': 'token=' + token + '; path=/admin; expires=' + now.toGMTString()});
                                res.end();
                            }
                        });
                        
                    });
                }else{
                    res.writeHead(302, {'Location': '/admin/index.html#invalid'});
                    res.end();
                }
            });
        }
        
        // The following stores browser and IP data to the database. //
        if(connection === null)
            connection = mySQLConnection();
        connection.query("INSERT INTO loginrecords (browser, ip) VALUES (?, ?)", [req.headers['user-agent'], req.connection.remoteAddress], function(err, result){
        });
        
        return;
    }
    
    // Log out //
    if(req.url === "/admin/logout/"){
        var cookies = getCookies(req);
        if(cookies.token !== null){
            var connection = mySQLConnection();
            connection.query("DELETE FROM tokens WHERE token = ?", [cookies.token], function(err, result){
               //error handling
            });
        }
        res.writeHead(302, {'Location': '/admin/', 'Set-Cookie': 'token=deleted; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT'});
        res.end();
        return;
    }
    // END administrator page management functions //
    
    // Add index.html page to req.url //
    if(req.url.indexOf('.') === -1){
        req.url = req.url + 'index.html';
    }
    
    // Load static files //
    loadFile(req.url, res);
    
}).listen(process.env.PORT, process.env.IP);

function cookieAndDBMatch(returnFun, request){
    var cookies = getCookies(request);
    
    if(cookies.token === null){
        returnFun(true, [{ct: 0}]);
        return;
    }
    
    var connection = mySQLConnection();
    connection.query("SELECT COUNT(*) AS ct FROM tokens WHERE token = ?", [cookies.token], returnFun);
}

function mySQLConnection(){
    var mysql = require("mysql");
    return mysql.createConnection({
        host: 'localhost',
        user: 'codeweb',
        password: '',
        database: 'c9'
    });
}

function getCookies(request){
    var cookies = {};
    request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    return cookies;
}

// Load static web content //
function loadFile(url, res){
    
    if(url.substr(0, 1) !== '/')
        url = "/" + url;
    
    if(url.indexOf("/.") === -1){// Don't load hidden files
        fs.readFile('client' + url, function(err, data) {//ensure all files are loaded from the client/ folder
            if(!err){
                //display static html page
                res.writeHead(200, {"Content-Type": mime.lookup(url)});
                res.end(data);
            }else if(err.errno == 34){
                //file not found
                fs.readFile("client/404.html", "utf-8", function(err, data) {
                    if(!err){
                        //write error page
                        res.writeHead(404, {"Content-Type": "text/html"});
                        res.end(data);
                    }else{
                        //if error page can't load
                        res.writeHead(404, {"Content-Type": "text/plain"});
                        res.end("404 File not Found.");
                    }
                });
            }else{
                //error loading file
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end("500 Internal Server Error");
            }
        });
    }else{
        //no read access to server javascript files or hidden files
        res.writeHead(403, {"Content-Type": "text/plain"});
        res.end("403 Access denied.");
    }
}