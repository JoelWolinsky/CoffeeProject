//      /Users/joelwolinsky/Desktop/Project/SocketNetflix/app.js
//      /usr/local/mysql/bin/mysql -ujoeltest -pjoel123


let bodyP = require("body-parser");
let cookieP = require("cookie-parser");
const SQL_OPT = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'sys'
};

const express = require('express');
let app = express();
app.use(express.static("client"));

app.use(bodyP.urlencoded({ extended: true }));
app.use(cookieP());
app.post('/username', function(req,res){
    let name = req.body.name;
    console.log(name);
    console.log(req.body);
    res.cookie('name',name,{maxAge:600000});
    res.sendFile(__dirname + '/client/Brew.html');
    
});



// app.get("/", function(req, res) {
//     res.sendFile("client/index.html");
// });
// app.get("/users/joel", function(req, res) {
//     res.sendFile(__dirname + "/client/history.html");
// });
// app.get("/users/motor", function(req, res) {
//     runMotors()
// });

let server = require('http').createServer(app).listen(3000);

let io = require('socket.io').listen(server);
io.on('connection', function (socket) {
    console.log('a client has connected');
        // socket.on('joel', function() {
        //     user = 'joel'
        //     console.log("joel received")
        //     clicked(this);

        // });

        // socket.on('mum', function() {
        //     user = 'mum'
        //     console.log("mum received")
        //     clicked(this);
        // });

        // socket.on('dad', function() {
        //     user = 'dad'
        //     console.log("dad received")
        //     clicked(this);pytho
        // });

    socket.on('history_data_request', historyDataRequest);
    socket.on('motor_request', runMotors);
    socket.on('scheduleData',scheduleDB)
  


});

let mysql = require('mysql');

function historyDataRequest(username) {
    console.log("running history_data_request")
    let socket = this;
    let con = mysql.createConnection(SQL_OPT);
    console.log(username+"request from history");
    con.connect(function(err) {
        if (err) throw err;
        //Select all customers and return the result object:
        con.query("SELECT userID FROM users WHERE name = ?", [username], function (err, result, fields) {
            let id = result[0].userID;
            con.query(`SELECT * FROM history WHERE userID = ? ORDER BY (brewID)`, [id], function (err, result, fields,) {
                if (err) throw err;
                        console.log(err);
                dataList = [];
                for(let i = 0; i < result.length; i++) {
                    brewID =  result[i].brewID;
                    userID = result[i].userID;
                    time =  result[i].time;
                    date = result[i].date;
                    
                    
    
                    var data = {brewID, userID, time, date};
                    dataList.push(data);
                }
                console.log(dataList)
                socket.emit('data_from_client', dataList);
                con.end();
            });
        });
    });
};

function runMotors() {
    console.log("running runMotors")
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python',["motortest.py", 'start']);
}
function scheduleDB(data){
    console.log(data)
}