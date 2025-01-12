
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'elektronik_sirket'
});

db.connect(function(err) {
    if (err) {
        console.error('Bağlantı hatası: ' + err.stack);
        return;
    }
    console.log('connected database');
});

module.exports = db;
