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

app.use(bodyP.urlencoded({ extended: true }));
app.use(cookieP("VfgJL4eJmW1U8XyJ5Gkm"));
app.use(express.static("client"));
app.get("/", function(req, res) {//app to get listens to the page
  console.log(12323123);
  if ("logged" in req.signedCookies) {
    res.sendFile(__dirname + "/client/home.html");
  } else {
    res.sendFile(__dirname + "/client/login.html");
  }
});

app.post("/login", function(req, res) {// gives post requests
  console.log(req.body);
  if (req.body.password == "ppe") {
    res.cookie("logged", "true", {signed: true, maxAge:60000});
    res.send("success");
  } else {
    res.status(403); //sends error
    res.send();
  }
});
app.post("/username", function(req, res) {
  let name = req.body.name;
  console.log(name);
  console.log(req.body);
  res.cookie("name", name, { maxAge: 6000000});
  res.sendFile(__dirname + "/client/Brew.html");
});
app.get("/secure/*", function(req, res) {
  if ("login" in req.signedCookies) {
    res.sendFile(__dirname + "/secure" + req.path.split("/")[1] + ".html" );
  }
});
app.get("*", function(req, res) {
  res.status(404);
  res.send("File not found");
});


let server = require("http").createServer(app).listen(3000);

let io = require("socket.io").listen(server);
io.on("connection", function(socket) {
  console.log("a client has connected");
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
  //console.log("running runMotors");
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn("python", ["motortest.py", "start"]);
}




//shedule
function weekCheck(data) {
  global.data = data;
  console.log("lesgoo",data)
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
      //console.log("new date " + d.toLocaleString());
      global.date = d.toLocaleString().split(" ")[0];
      global.dataCheck = 1;
      //console.log(date);
      //console.log('ns')
      newSchedule();
    }
  } else {
    console.log('elseboi')
    newSchedule();
  }
}

var repeatCheck, username, type, time;


function newSchedule() {
   global.username = data["name"];
   global.type = data["type"];
   global.time = data["time"];
   global.date;
   console.log("lesgo",data)

  //console.log(global.dataCheck == 1);

  if (global.dataCheck == 1) {
    date = global.date;

    console.log("hello date:  ", global.date)
    global.repeatCheck = 1;
    global.dateCheck = 0; 
    
    //console.log("if");
    //console.log("hellow date: ", global.date)
    db()
    console.log('yyet')
    
  } else {
    console.log("else date");
    global.date = data["date"];
    //console.log(global.date);
    global.repeatCheck = 0;
    var from = global.date.split("/");
    global.date = from[2] + "-" + from[0] + "-" + from[1];
    //console.log(global.date);
    db()
  }

}

function db(){

  //console.log(global.data);
  //console.log("date = " + global.date);
  let con = mysql.createConnection(SQL_OPT);
  con.connect(function(err) {
    if (err) throw err;
    //Select all customers and return the result object:
    con.query("SELECT userID FROM users WHERE name = ?", [global.username], function(
      err,
      result,
      fields
    ) {
      let id = result[0].userID;
      //console.log(id);
      console.log('db1s')
      con.query(
        "INSERT INTO schedule (userID,time,date) VALUES (?,?,?)",[id, global.time, global.date],
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













// // var five =require('johnny-five'); //require/import the johnny-five module
// // var board=new five.Board(); //the Board class from johnny-five module

// // // When the board is ready create a led object on pin 13 and blink it 
// // // every 500 milliseconds.

// // board.on('ready',function(){
// //     var led=new five.Led(13);
// //     led.blink(500);});



// var five = require("johnny-five");
// var board = new five.Board();

// board.on("ready", function() {

//   /**
//    * In order to use the Stepper class, your board must be flashed with
//    * either of the following:
//    *
//    * - AdvancedFirmata https://github.com/soundanalogous/AdvancedFirmata
//    * - ConfigurableFirmata https://github.com/firmata/arduino/releases/tag/v2.6.2
//    *
//    */
//   console.log('run')
//   var stepper = new five.Stepper({
//     type: five.Stepper.TYPE.DRIVER,
//     stepsPerRev: 200,
//     pins: {
//       step: 12,
//       dir: 11
//     }
//   });
//   console.log('run')
//   // Make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
//   stepper.rpm(180).ccw().accel(1600).decel(1600).step(2000, function() {

//     console.log("Done moving CCW");

//     // once first movement is done, make 10 revolutions clockwise at previously
//     //      defined speed, accel, and decel by passing an object into stepper.step
//     stepper.step({
//       steps: 2000,
//       direction: five.Stepper.DIRECTION.CW
//     }, function() {
//       console.log("Done moving CW");
//     });
//   });
// });

