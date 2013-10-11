S-Admin
===================

S-Admin (Secured Admin) is basic sample code for an admin page with Node.js.

* S-Admin does NOT use Express... and it requires only 3 basic dependencies.

* S-Admin implements custom session storage using a cookie and MySQL (no NPM dependencies used for sessions).

* Simply edit credentials.js to add as many users as you wish for the /admin page.

* S-Admin requires 2 MySQL tables: tokens (column: token - string), and loginrecords (columns: browser - string, ip - string). The loginrecords table is not required if you don't want to track login attempts. Simply remove lines 128 - 131 from server.js

* S-Admin has NOT been tested for security and is not created to be used as-is. The primary purpose was to create an open source admin project.

* Simply run server.js using Node.js and click the admin link. Use one of the credentials from credentials.js to log in.
 
* Edge version is available at: https://c9.io/codeweb/s-admin