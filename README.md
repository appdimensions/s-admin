S-Admin
===================

S-Admin (Secured Admin) is basic sample code for an admin page with Node.js.

* S-Admin does NOT use Express... and it requires only 3 basic dependencies.

* S-Admin implements custom session storage using a cookie and MySQL (no NPM dependencies used for sessions).

* Simply edit credentials.js to add as many users as you wish for the /admin page.

* S-Admin requires 2 MySQL tables: tokens (column: token - string), and loginrecords (columns: browser - string, ip - string). The loginrecords table is not required if you don't want to track login attempts. Simply remove lines 128 - 131 from server.js

* S-Admin has NOT been heavily tested for security and is not created to be used exactly as-is. The primary purpose was to create an open source admin project.
 
* Edge version is available at: https://c9.io/codeweb/s-admin


How To Use S-Admin
===================

S-Admin requires 2 MySQL tables: tokens (column: token - string), and loginrecords (columns: browser - string, ip - string). The loginrecords table is not required if you don't want to track login attempts. Simply remove lines 129 - 132 from server.js

Once you have created the required tables, simply (1) clone the project, (2) edit mySQLConnection() in server.js and add your credentials, (3) run server.js, and (4) click the admin link. Use one of the credentials from credentials.js to log in.

To use s-admin for your own app, take a look at the comments in server.js for improvement suggestions, and modify the code as you need.