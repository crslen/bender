var wordfilter = require('wordfilter');
//let fields = require("../model/valFields");
var valFunc = require('../model/valFunctions')
const sql = require('mssql')
const config = {
  user: process.env.sql_user,
  password: process.env.sql_password,
  server: process.env.sql_server, // You can use 'localhost\\instance' to connect to named instance
  database: process.env.sql_database,
  options: {
    encrypt: false // Use this if you're on Windows Azure
  }
}

module.exports = function(controller) {

  controller.hears(['new one thing report', 'add one thing report for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    var oneThing; //customer name
    var category = "";
    var seName = "";
    seName = message.match[1];
    console.log("name:" + seName);

    let askOneThing = (response, convo) => {
      convo.ask("What is your one thing you want to report this week?", (response, convo) => {
        oneThing = response.text;
        convo.next();
        bot.api.users.info({
          user: message.user
        }, (error, response) => {
          let {
            name,
            real_name
          } = response.user;
          console.log(name, real_name);
          //do something
          //get date in mm/dd/yyyy format
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth() + 1; //January is 0!
          var yyyy = today.getFullYear();

          if (dd < 10) {
            dd = '0' + dd
          }

          if (mm < 10) {
            mm = '0' + mm
          }
          var todayDate = mm + '/' + dd + '/' + yyyy;

          if (seName == "") {
            seName = real_name;
          }

          //db data
          var rows = "('" + todayDate + "','" + category + "','" + seName + "','" + oneThing + "')"
          insertRows(rows, function(res) {
            if (res == 0) {
              bot.reply(message, {
                text: "Your info was not added for whatever reason."
              });
            } else {
              bot.reply(message, {
                text: "Your info has been added!"
              });
            }
          });
          //segment data
          var jsonInput = {
            "event": "One Thing Report",
            "userId": "clennon@vmware.com",
            "properties": {
              "datetime_created": todayDate,
              "Category": category,
              "Specialist": seName,
              "The_One_Thing": oneThing
            }
          }
          valFunc.insertSegment(jsonInput, function(res) {
            console.log("segment response: " + res);
          });
        });
      });
    };
    bot.startConversation(message, askOneThing);
  });

  controller.hears(['export one thing report'], 'direct_message,direct_mention,mention', (bot, message) => {

    bot.reply(message, "Please hold.....");
    getRows(function(res) {
      if (res.length == 0) {
        bot.reply(message, {
          text: "Hmm something bad happend, I can't query this information."
        });
      } else {
        var jsonParse = JSON.stringify(res);
        console.log("return: " + jsonParse);
        var jsonStr = JSON.parse(jsonParse);

        for (var i = 0; i < jsonStr.length; i++) {
          var date = new Date(jsonStr[i].datetime_created)
          var otDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          bot.reply(message, {
            text: "`" + otDate + "` - " + jsonStr[i].The_One_Thing + " *" + jsonStr[i].Specialist + "*"
          });
        }
      }
    });
  });


  /*  function to insert data into sql server */
  function insertRows(rows, callback) {
    // Imports the mssql query
    let sqlQuery;

    // insert val tracker
    sqlQuery = `INSERT INTO [dbo].[one_thing_report]
                            ([datetime_created]
                            ,[category]
                            ,[Specialist]
                            ,[The_One_Thing])
                      VALUES
                      ${rows}`;

    console.log(sqlQuery);
    sql.connect(config, err => {
      // Query
      new sql.Request().query(sqlQuery, (err, result) => {
        // ... error checks
        sql.close();
        console.log(result, err)
        if (err == null) {
          return callback(err);
        } else {
          return callback(result.rowsAffected);
        }
      })

    })

    sql.on('error', err => {
      console.log(err)
    })
  }

  /*  function to insert data into sql server */
  function getRows(callback) {
    // Imports the mssql query
    let sqlQuery;

    // insert val tracker
    sqlQuery = `SELECT * FROM [dbo].[one_thing_report]
                WHERE [datetime_created] >= DATEADD(DAY, -14, GETDATE())
                order by [datetime_created]`;

    console.log(sqlQuery);
    sql.connect(config, err => {
      // Query
      new sql.Request().query(sqlQuery, (err, result) => {
        // ... error checks
        sql.close();
        console.log(result);
        return callback(result.recordset);
      })

    })

    sql.on('error', err => {
      console.log(err)
    })
  }
}; /*the end*/
