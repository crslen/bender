/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
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
var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

module.exports = function(controller) {

  controller.hears(['get (.*) sddc'], 'direct_message,direct_mention,mention', (bot, message) => {

    var customer = message.match[1];

    getCustomer(customer, function(res) {
      if (res[0].result == "No") {
        bot.reply(message, "I can't find " + customer + ". Use `@bender get " + customer + "` to get more information.")
      } else {
        bot.reply(message, "Checking to see if I have a refresh token for " + customer);
        //check to see if org and refresh token are in tech validation table
        getToken(customer, function(res) {
          var jsonParse = JSON.stringify(res);
          console.log("parse:" + jsonParse);
          var jsonStr = JSON.parse(jsonParse);
          var orgId = jsonStr[0].org_id;
          var rToken = jsonStr[0].refresh_token;
          console.log("orgid: " + orgId);
          console.log("refreshtoken: " + rToken);
          if (orgId != "" && rToken != "") {
            bot.reply(message, "OK, I can help you with that!");
            valFunc.getSDDC(orgId, rToken, function(sddc) {
              if (sddc.length == 2) {
                bot.reply(message, {
                  text: "I couldn't find any SDDC's deployed for " + customer + "."
                });
              } else {
                var jsonStr = JSON.parse(sddc);
                console.log("results:" + jsonStr.length);

                for (var i = 0; i < jsonStr.length; i++) {
                  //if (jsonStr[i].Actual_Start_Date == null) {var startDate = "None"} else {var startDate = jsonStr[i].Actual_Start_Date.value}
                  //if (jsonStr[i].End_Date == null) {var endDate = "None"} else {var endDate = jsonStr[i].End_Date.value}
                  bot.reply(message, {
                    text: "Here's what I found for " + customer,
                    attachments: [{
                      "title": "SDDC Info",
                      "color": colorArray[i],
                      //"title": "Mode Analytics Report",
                      //"title_link": "https://modeanalytics.com/vmware_inc/reports/1c69ccf26a01",
                      "fields": [{
                          "title": "SDDC Name",
                          "value": jsonStr[i].name,
                          "short": true
                        },
                        {
                          "title": "Status",
                          "value": jsonStr[i].sddc_state,
                          "short": true
                        },
                        {
                          "title": "Created",
                          "value": jsonStr[i].created,
                          "short": true
                        },
                        {
                          "title": "vCenter URL",
                          "value": jsonStr[i].resource_config.vc_url,
                          "short": true
                        },
                        {
                          "title": "AWS Region",
                          "value": jsonStr[i].resource_config.region,
                          "short": true
                        },
                        {
                          "title": "AWS Availability Zone",
                          "value": jsonStr[i].resource_config.esx_hosts[0].availability_zone,
                          "short": true
                        },
                        {
                          "title": "VMC Version",
                          "value": jsonStr[i].resource_config.sddc_manifest.vmc_version,
                          "short": true
                        },
                        {
                          "title": "VMC Internal Version",
                          "value": jsonStr[i].resource_config.sddc_manifest.vmc_internal_version,
                          "short": true
                        },
                        {
                          "title": "Org ID",
                          "value": jsonStr[i].org_id,
                          "short": true
                        },
                        {
                          "title": "SDDC ID",
                          "value": jsonStr[i].resource_config.sddc_id,
                          "short": true
                        }
                      ],
                    }]
                  });
                }
              }
            });
          } else {
            bot.reply(message, "I cannot find Org ID or refresh token in the Tech Validation database for " + customer + ". Use `@bender update " + customer + "` to update Org ID and refresh token.")
          }
        });
      }
    });

    //bot.startConversation(message, askAuthToken);
  });


  //check to see if customer exists in tech validation table
  function getToken(customer, callback) {
    customer = customer.replace("&", "_");
    let sqlQuery;

    sqlQuery = `select org_id, refresh_token
                  from dbo.tech_validation
                  where customer_name like '%${customer}%'`;

    sql.connect(config, err => {
      console.log("connect error: " + err);

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

  //check to see if customer exists in tech validation table
  function getCustomer(customer, callback) {
    customer = customer.replace("&", "_");
    let sqlQuery;

    sqlQuery = `select dbo.get_tech_validation_customer_fn('${customer}') AS result`;
    sql.connect(config, err => {
      console.log("connect error: " + err);
      new sql.Request().query(sqlQuery, (err, result) => {
        // ... error checks
        sql.close();
        console.log(result.recordset);
        return callback(result.recordset);
      })
    })

    sql.on('error', err => {
      console.log("on error:" + err);
    })
  }

  /* Utility function to get SDDC info*/
  /*function getSDDC(orgId, rToken, callback) {
    var request = require('request');
    //get auth token
    request.post({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      form: {
        "refresh_token": rToken
      },
      url: "https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize"
    }, function(error, response, body) {
      var jsonStr = JSON.parse(body);
      var rToken = jsonStr.access_token;
      console.log("token-" + rToken);
      //return callback(rToken);
      //get sddc status
      var request = require('request');
      request.get({
        headers: {
          'csp-auth-token': rToken,
          'Content-Type': 'application/json'
        },
        url: "https://vmc.vmware.com/vmc/api/orgs/" + orgId + "/sddcs"
        //url: "https://vmc.vmware.com/vmc/api/orgs"
      }, function(error, response, body) {
        return callback(body);
      });
    });
  }*/
}; /* the end */
