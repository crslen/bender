/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
let fields = require("../json/valFields");
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
      });
    };

    let confTask = (response, convo) => {
      //convo.setVar('createorg', getInvite(function(rToken){}));
      //convo.say("Ok, just making sure you're doing your work properly :smile:.  Time to work my magic and create an invitation for " + customer);
      getInvite(function(rToken) {
        //console.log("response" + rToken);
        //convo.say("Here's the invite: {{rToken}}");
        bot.reply(message, {
          text: "Here's the invite for " + customer + " - " + rToken
        });
        bot.reply(message, {
          text: "Once the org is created make sure to update the tech validation with the new org ID using 'Update " + customer + "'."
        });
      });
      //convo.say("Here's the invite: {{vars.createorg}}")
    };


    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, askCustomer);

  });

  /* Utility function to format uptime */
  function getInvite(callback) {
    var request = require('request');
    //get auth token
    request.post({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      form: {
        "refresh_token": process.env.create_refresh_token
      },
      url: "https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize"
    }, function(error, response, body) {
      console.log("body-" + body);
      var jsonStr = JSON.parse(body);
      var rToken = jsonStr.access_token;
      console.log("token-" + rToken);
      //return callback(rToken);
      //request org invitation url
      var request = require('request');
      request.post({
        headers: {
          'csp-auth-token': rToken,
          'Content-Type': 'application/json'
        },
        json: {
          "preset_name": "CUSTOMER",
          "number_of_invitations": "1",
          "invitation_properties": {
            "defaultAwsRegions": "US_EAST_1,US_WEST_2,EU_WEST_2",
            "enableZeroCloudCloudProvider": "false",
            "skipSubscriptionCheck": "true",
            "enableAWSCloudProvider": "true",
            "accountLinkingOptional": "false",
            "enabledAvailabilityZones": "{\"us-east-1\":[\"iad6\",\"iad7\",\"iad12\"],\"us-west-2\":[\"pdx1\",\"pdx2\",\"pdx4\"],\"eu-west-2\":[\"lhr54\",\"lhr55\"]}",
            "sddcLimit": "1",
            "sla": "CUSTOMER",
            "orgType": "CUSTOMER_POC",
            "defaultHostsPerSddc": "4",
            "hostLimit": "6",
            "defaultIADDatacenter": "iad6",
            "defaultPDXDatacenter": "pdx4"
          },
          "funds_required": "false"
        },
        url: "https://vmc.vmware.com/vmc/api/operator/invitations/service-invitations"
      }, function(error, response, body) {
        //var invite = JSON.parse(body);
        console.log("Invite - " + body);
        return callback(body);
      });
    });
  }

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
