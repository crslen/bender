/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
//let fields = require("../model/valFields");
let valFunc = require("../model/valFunctions");
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

  controller.hears(['create org', 'new org'], 'direct_message,direct_mention,mention', (bot, message) => {

    let customer;

    let askCustomer = (response, convo) => {

      convo.ask("What's the customer name?", (response, convo) => {
        customer = response.text;
        valFunc.getCustomer(customer, function(res) {
          var results = res[0].result.split('|');
          if (results[0] == "Yes" && results[1].indexOf("POC") >= 0) {
            bot.reply(message, "Glad to see " + customer + " is in the tech validation database.");
            selectCustomer(customer, function(res) {
              console.log("response: " + res[0].response);
              if (res[0].response == 'No') {
                bot.reply(message, {
                  text: "I couldn't find any pre-flight info on " + customer + ".  Make sure the customer and account team fills out this survey - https://www.surveymonkey.com/r/vmc-tech-val-preflight"
                });
              } else {
                bot.reply(message, {
                  text: fields.yayMessage() + "  I see that " + customer + " filled out the pre-flight survey.  You're one step closer to onboarding!"
                });
              }
              confTask(response, convo);
              convo.next();
            });
          } else {
            bot.reply(message, "I don't see *" + customer + "* in the tech validation database or this has been selected as a *paid pilot*. If it's not a paid pilot make sure " + customer + " is added by asking me `@bender add POC for " + customer + "`")
            convo.stop();
          }
        });

      });
    };

    let confTask = (response, convo) => {
      valFunc.getInvite(function(vmcInvite) {
        bot.reply(message, {
          text: "Here's the invite for " + customer + " - " + vmcInvite
        });
        bot.reply(message, {
          text: "Once the org is created make sure to update the tech validation with the new org ID using `@bender Update " + customer + "`."
        });
      });
    };
    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, askCustomer);

  });

  function selectCustomer(customer, callback) {

    let sqlQuery;
    sqlQuery = `SELECT dbo.get_pre_flight_fn('${customer}') as response`;

    sql.connect(config, err => {
      console.log("connect error: " + err);

      // Query

      new sql.Request().query(sqlQuery, (err, result) => {
        // ... error checks
        sql.close();
        console.log(result);
        return callback(result.recordset);
      })

    })

    sql.on('error', err => {
      console.log("on error:" + err);
    })
  }

}; /* the end */
