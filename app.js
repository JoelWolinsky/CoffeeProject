//  /Users/joelwolinsky/Desktop/Project/SocketNetflix/app.js
const SQL_OPT = {
    host: 'localhost',
    user: 'joeltest',
    password: 'joel123',
    database: 'test1'
};

const express = require('express');
let app = express();

app.use(express.static("client"));
app.get("/", function(req, res) {
    res.sendFile("client/index.html");
});
app.get("/users/joel", function(req, res) {
    res.sendFile(__dirname + "/client/history.html");
});

let server = require('http').createServer(app).listen(3000);

let io = require('socket.io').listen(server);
io.on('connection', function (socket) {
    console.log('a client has connected');
    socket.on('joel', function() {
        user = 'joel'
        console.log("joel received")
        clicked(this);
    });

    socket.on('mum', function() {
        user = 'mum'
        console.log("mum received")
        clicked(this);
    });

    socket.on('dad', function() {
        user = 'dad'
        console.log("dad received")
        clicked(this);
    });

    socket.on('history_data_request', historyDataRequest);

});

let mysql = require('mysql');

const spawn = require("child_process").spawn;
const pythonProcess = spawn('python',["path/to/script.py"]);


function historyDataRequest() {
    console.log("running history_data_request")
    let socket = this;
    let con = mysql.createConnection(SQL_OPT);
    con.connect(function(err) {
        if (err) throw err;
        //Select all customers and return the result object:
        //con.query("SELECT * FROM history WHERE userID IN (1)", function (err, result, fields,) {
        con.query("SELECT * FROM history order by (brewID)", function (err, result, fields,) {
        if (err) throw err;
                console.log(err);
        dataList = [];
        for(var i = 0; i < result.length; i++) {
            brewID =  result[i].brewID;
            userID = result[i].userID;
            

            var data = {brewID, userID};
            dataList.push(data);
        }
        console.log(dataList)
        socket.emit('data_from_client', dataList);
        });
        con.end();
    });
};