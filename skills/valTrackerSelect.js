/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
var valFunc = require('../model/valFunctions')
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

  /* Collect some very simple runtime stats for use in the uptime/debug command */
  var stats = {
    triggers: 0,
    convos: 0,
  }

  controller.on('interactive_message_callback', function(bot, message) {
    var ids = message.callback_id.split('|');
    var user_id = ids[0];
    var customer = ids[1];
    var sfdc_id = ids[2];
    console.log("action: " + message.actions[0].value);
    if (message.actions[0].value == 'showSDDC') {
      bot.reply(message, "Checking to see if I have a refresh token for " + customer);
      //check to see if org and refresh token are in tech validation table
      valFunc.getToken(customer, function(res) {
        var jsonParse = JSON.stringify(res);
        console.log("parse:" + jsonParse);
        var jsonStr = JSON.parse(jsonParse);
        var orgId = jsonStr[0].org_id;
        var rToken = jsonStr[0].refresh_token;
        console.log("orgid: " + orgId);
        console.log("refreshtoken: " + rToken);
        if (rToken !== null) {
          //bot.reply(message, "OK, I can help you with that!");
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
    if (message.actions[0].value == 'extendPOC') {
      let askExtReq = (response, convo) => {
        bot.api.users.info({
          user: message.user
        }, (error, response) => {
          let {
            id,
            name,
            real_name
          } = response.user;
          console.log(id, name, real_name);
          convo.ask("Please give me a description of why the POC needs to be extended and how long. (i.e. technical issues, unfinished testing, customer sat issue, etc.)", (response, convo) => {
            extReq = response.text;
            //sweemer hardcastle reedy
            var approvers = "<@U40TBNTTQ> <@U3U3D17MK> <@U3U3K6HM2>";
            var message_options = [
              "Hear ye hear ye, a request from " + real_name + " to extend " + customer + "'s POC has been requested. \n *" + extReq + "*  \n" + approvers + " do you approve? ",
              "Attention K-Mart shoppers, " + real_name + " has requested an extention for " + customer + ".  \n *" + extReq + "*  \n" + approvers + " do you approve?"
            ]
            var random_index = Math.floor(Math.random() * message_options.length);
            var chosen_message = message_options[random_index];
            bot.reply(message, "I will notify the approvers in the #poc_extension_request channel.");
            bot.say({
              channel: "#poc_extension_request",
              text: chosen_message
            });
            convo.next();
          });
        });
      };
      bot.startConversation(message, askExtReq);
    }
    if (message.actions[0].value == 'showSFDC') {
      //get opp id
      valFunc.getSFDC(sfdc_id, function(sfdc) {
        //don't ask me why
        var jsonParse = JSON.stringify(sfdc);
        var jsonStr = JSON.parse(jsonParse);
        if (jsonStr[0].SF_Opportunity_ID !== null) {
          bot.reply(message, {
            text: "Here's what I found for " + customer,
            attachments: [{
              "title": "SFDC Opportunity Info",
              "color": "#1AB399",
              "title": "VMware SalesForce",
              "title_link": "https://vmware.my.salesforce.com/" + sfdc_id,
              "fields": [{
                  "title": "Opportunity Name",
                  "value": jsonStr[0].Name,
                  "short": true
                },
                {
                  "title": "SF Opportunity ID",
                  "value": jsonStr[0].SF_Opportunity_ID,
                  "short": true
                },
                {
                  "title": "Opportunity Type",
                  "value": jsonStr[0].Opportunity_Record_Type,
                  "short": true
                },
                {
                  "title": "Account Name",
                  "value": jsonStr[0].Account_Name,
                  "short": true
                },
                {
                  "title": "Geo",
                  "value": jsonStr[0].Geo,
                  "short": true
                },
                {
                  "title": "Industry",
                  "value": jsonStr[0].Industry,
                  "short": true
                },
                {
                  "title": "Country",
                  "value": jsonStr[0].Country,
                  "short": true
                },
                {
                  "title": "Vertical",
                  "value": jsonStr[0].Sales_Classification,
                  "short": true
                },
                {
                  "title": "Stage",
                  "value": jsonStr[0].Stage,
                  "short": true
                },
                {
                  "title": "Opportunity Owner",
                  "value": jsonStr[0].Opportunity_Owner,
                  "short": true
                }
              ],
            }]
          });
        } else {
          bot.reply(message, "Hmm there might be an issue with the SF ID I have.  Make sure it's the valid alpha-numeric ID.");
        }
      });
    }
  });

  controller.hears(['what is (.*) working on'], 'direct_message, direct_mention,mention', function(bot, message) {

    var seName = message.match[1];
    var searchType = 0; //SE Search
    bot.reply(message, "Please hold.....");
    bot.createConversation(message, function(err, convo) {
      selectCustomer(seName, searchType, function(res) {
        if (res.length == 0) {
          bot.reply(message, {
            text: "I couldn't find any info on " + seName + "."
          });
        } else {
          var jsonParse = JSON.stringify(res);
          var jsonStr = JSON.parse(jsonParse);

          for (var i = 0; i < jsonStr.length; i++) {
            if (jsonStr[i].Actual_Start_Date == null) {
              var startDate = "None"
            } else {
              var startDate = jsonStr[i].Actual_Start_Date.value
            }
            if (jsonStr[i].End_Date == null) {
              var endDate = "None"
            } else {
              var endDate = jsonStr[i].End_Date.value
            }

            bot.reply(message, {
              text: "Here's what I found for " + jsonStr[i].Customer_Name,
              attachments: [{
                "title": "Validation Tracker Info",
                "color": colorArray[i],
                //"title": "Mode Analytics Report",
                //"title_link": "https://modeanalytics.com/vmware_inc/reports/1c69ccf26a01",
                "fields": [{
                    "title": "Customer",
                    "value": jsonStr[i].Customer_Name,
                    "short": true
                  },
                  {
                    "title": "Status",
                    "value": jsonStr[i].Status + " - " + jsonStr[i].Type,
                    "short": true
                  }
                ],
              }]
            });
          }
        }
      });
      //convo.say("Here's the invite: {{vars.createorg}}")
    });
  });


  controller.hears(['get (.*)', 'show (.*)'], 'direct_message, direct_mention,mention', function(bot, message) {

    var customer = message.match[1];
    var searchType = 1; //customer search
    bot.reply(message, "Please hold.....");
    //bot.createConversation(message, function(err, convo) {
    selectCustomer(customer, searchType, function(res) {
      if (res.length == 0) {
        bot.reply(message, {
          text: "I couldn't find any info on " + customer + "."
        });
      } else {
        var jsonParse = JSON.stringify(res);
        console.log("return: " + jsonParse);
        var jsonStr = JSON.parse(jsonParse);

        for (var i = 0; i < jsonStr.length; i++) {
          //  if (jsonStr[i].Actual_Start_Date == null) {var startDate = "None"} else {var startDate = jsonStr[i].Actual_Start_Date.value}
          //if (jsonStr[i].End_Date == null) {var endDate = ""} else {var endDate = jsonStr[i].End_Date.value}
          if (jsonStr[i].compliance !== null) {
            var compliance = jsonStr[i].compliance.replace("|", "\n")
          } else {
            var compliance = "None"
          };
          if (jsonStr[i].use_case !== null) {
            var use_case = jsonStr[i].use_case.replace("|", "\n")
          } else {
            var use_case = "None"
          };
          if (jsonStr[i].region !== null) {
            var region = jsonStr[i].region.replace("|", "\n")
          } else {
            var region = "None"
          };
          if (jsonStr[i].services !== null) {
            var service = jsonStr[i].services.replace("|", "\n")
          } else {
            var service = "None"
          };
          bot.reply(message, {
            text: "Here's what I found for " + jsonStr[i].Customer_Name,
            attachments: [{
              "title": "Validation Tracker Info",
              "color": colorArray[i],
              "title": "Mode Analytics Report",
              "title_link": "https://modeanalytics.com/vmware_inc/reports/e869ce5736c1",
              "fields": [{
                  "title": "Customer",
                  "value": jsonStr[i].Customer_Name,
                  "short": true
                },
                {
                  "title": "Status",
                  "value": jsonStr[i].Status + " - " + jsonStr[i].Type,
                  "short": true
                },
                {
                  "title": "SET Member",
                  "value": jsonStr[i].SE_Specialist,
                  "short": true
                },
                {
                  "title": "Use Cases",
                  "value": use_case,
                  "short": true
                },
                {
                  "title": "Start Date",
                  "value": jsonStr[i].Expected_Start_Date,
                  "short": true
                },
                {
                  "title": "End Date",
                  "value": jsonStr[i].Expected_End_Date,
                  "short": true
                },
                {
                  "title": "AWS Regions",
                  "value": region,
                  "short": true
                },
                {
                  "title": "Compliance Requirements",
                  "value": compliance,
                  "short": true
                },
                {
                  "title": "Services",
                  "value": service,
                  "short": true
                },
                {
                  "title": "Org ID",
                  "value": jsonStr[i].ORG_ID,
                  "short": true
                },
                {
                  "title": "CS Architect",
                  "value": jsonStr[i].CS_Architect,
                  "short": true
                },
                {
                  "title": "Cloud Specialist",
                  "value": jsonStr[i].Cloud_Specialist,
                  "short": true
                },
                {
                  "title": "Refresh Token?",
                  "value": jsonStr[i].refresh_token,
                  "short": true
                },
                {
                  "title": "Pre-flight Complete?",
                  "value": jsonStr[i].pre_flight,
                  "short": true
                },
                {
                  "title": "SF Opportunity ID",
                  "value": jsonStr[i].SFDC_OPPTY_ID_RAW, //https://vmware.my.salesforce.com/_ui/search/ui/UnifiedSearchResults?searchType=2&str=
                  "short": true
                },
                {
                  "title": "Notes",
                  "value": jsonStr[i].Notes,
                  "short": false
                }
              ],
              callback_id: 'actions|' + customer + "|" + jsonStr[i].SFDC_OPPTY_ID_RAW,
              actions: [{
                  "name": "sddc",
                  "text": "Show SDDC",
                  "value": "showSDDC",
                  "type": "button",
                },
                {
                  "name": "sfdc",
                  "text": "Show SF Opp",
                  "value": "showSFDC",
                  "type": "button",
                },
                {
                  "name": "extend",
                  "text": "Extend POC",
                  "value": "extendPOC",
                  "type": "button",
                }
              ],
            }]
          });
        }
      }
    });
  });

  //function to get customer tracker information
  function selectCustomer(customer, searchType, callback) {
    customer = customer.replace("&", "_");
    let sqlQuery;
    if (searchType == 1) {
      // Search by customer name
      sqlQuery = `SELECT *
                      FROM dbo.tech_validation_tracker_view
                      WHERE lower(Customer_name) like '%${customer}%'`;
    } else {
      //search by SE
      sqlQuery = `SELECT *
                      FROM dbo.tech_validation_tracker_view
                      WHERE lower(SE_Specialist) like '%${customer}%'`;
    }
    sql.connect(config, err => {
      console.log("connect error: " + err);

      // Query

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
}; /* the end */
