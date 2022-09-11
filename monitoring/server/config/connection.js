const mysql = require('mysql2');

module.exports = connection = mysql.createConnection({
    host: "35.223.130.73",
    user: "root",
    port: 3306,
    password: "sopes12022",
    database: "practice2"
});