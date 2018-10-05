//      /Users/joelwolinsky/Desktop/Project/SocketNetflix/app.js
//      /usr/local/mysql/bin/mysql -ujoeltest -pjoel123

let bodyP = require("body-parser");
let cookieP = require("cookie-parser");
const SQL_OPT = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "sys"
};

const express = require("express");
let app = express();
app.use(express.static("client"));

app.use(bodyP.urlencoded({ extended: true }));
app.use(cookieP());
app.post("/username", function(req, res) {
  let name = req.body.name;
  console.log(name);
  console.log(req.body);
  res.cookie("name", name, { maxAge: 600000 });
  res.sendFile(__dirname + "/client/Brew.html");
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

let server = require("http")
  .createServer(app)
  .listen(3000);

let io = require("socket.io").listen(server);
io.on("connection", function(socket) {
  console.log("a client has connected");
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

  socket.on("history_data_request", historyDataRequest);
  socket.on("motor_request", runMotors);
  socket.on("scheduleData", weekCheck);
});

let mysql = require("mysql");

function historyDataRequest(username) {
  console.log("running history_data_request");
  let socket = this;
  let con = mysql.createConnection(SQL_OPT);
  console.log(username + "request from history");
  con.connect(function(err) {
    if (err) throw err;
    //Select all customers and return the result object:

    con.query("SELECT userID FROM users WHERE name = ?", [username], function(
      err,
      result,
      fields
    ) {
      let id = result[0].userID;
      con.query(
        `SELECT * FROM history WHERE userID = ? ORDER BY (brewID)`,
        [id],
        function(err, result, fields) {
          if (err) throw err;
          console.log(err);
          dataList = [];
          for (let i = 0; i < result.length; i++) {
            brewID = result[i].brewID;
            userID = result[i].userID;
            time = result[i].time;
            date = result[i].date;

            var data = { brewID, userID, time, date };
            dataList.push(data);
          }
          console.log(dataList);
          socket.emit("data_from_client", dataList);
          con.end();
        }
      );
    });
  });
}

function runMotors() {
  console.log("running runMotors");
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn("python", ["motortest.py", "start"]);
}

function weekCheck(data) {
  global.data = data;
  //console.log(data)
  if (Array.isArray(data["date"]) === true) {
    var days = data["date"];

    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var d = new Date();
    for (i = 0; i < days.length; i++) {
      var daysUntil = weekday.indexOf(days[i]) - d.getDay();
      if (daysUntil < 0) {
        daysUntil += 7;
      }
      d.setDate(d.getDate() + daysUntil);
      console.log("new date " + d.toLocaleString());
      global.date = d.toLocaleString().split(" ")[0];
      global.dataCheck = 1;
      console.log(date);
      newSchedule();
    }
  } else {
    newSchedule();
  }
}

var repeatCheck;

function newSchedule() {
  var username = data["name"];
  var type = data["type"];
  var time = data["time"];
  var date;

  console.log(global.dataCheck == 1);

  if (global.dataCheck == 1) {
    date = global.date;

    console.log("hellow date: ", global.date)
    global.repeatCheck = 1;
    global.dateCheck = 0;
    
    console.log("if");
    console.log("hellow date: ", global.date)

  } else {
    console.log("else date");
    global.date = data["date"];
    console.log(global.date);
    global.repeatCheck = 0;
    var from = global.date.split("/");
    global.date = from[2] + "-" + from[0] + "-" + from[1];
    console.log(global.date);
  }

  console.log(global.data);
  console.log("date = " + global.date);
  let con = mysql.createConnection(SQL_OPT);
  con.connect(function(err) {
    if (err) throw err;
    //Select all customers and return the result object:
    con.query("SELECT userID FROM users WHERE name = ?", [username], function(
      err,
      result,
      fields
    ) {
      let id = result[0].userID;
      console.log(id);

      con.query(
        "INSERT INTO schedule (userID,time,date) VALUES (?,?,?)",
        [id, time, global.date],
        function(err, result, fields) {
          if (err) throw err;
          console.log("db done");
          con.end();
        }
      );
    });
  });
}

function repeatWeek() {
  var d = new Date();
  console.log("Today is: " + d.toLocaleString());
  d.setDate(d.getDate() + 7);
  console.log("<br>in 7 days it is: " + d.toLocaleString());
}
