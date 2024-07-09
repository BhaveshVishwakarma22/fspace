const mysql = require('mysql')

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'f_space_main',
})

connection.connect((err)=>{
    if(err) console.log(err.message);
    else console.log('Connected to MySql Server!');
})


module.exports = connection;