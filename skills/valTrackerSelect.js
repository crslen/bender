/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
var valFunc = require('../model/valFunctions')
var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];
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


  controller.on('interactive_message_callback', function(bot, message) {
    var ids = message.callback_id.split('|');
    var action_id = message.actions[0].value;
    var customer = ids[1];
    var sfdc_id = ids[2];
    var orgId = ids[3];
    console.log("callback: " + message.callback_id);
    console.log("action: " + action_id);
    if (action_id == 'showSDDC') {
      valFunc.getSDDC(orgId, function(sddc) {
        if (sddc.length == 0) {
          bot.reply(message, {
            text: "I couldn't find any SDDC's deployed for " + customer + "."
          });
        } else {
          var sddcStr = JSON.stringify(sddc);
          var jsonStr = JSON.parse(sddcStr);
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
                    "title": "Age in Days",
                    "value": jsonStr[i].age_days,
                    "short": true
                  },
                  {
                    "title": "AWS Region",
                    "value": jsonStr[i].region,
                    "short": true
                  },
                  {
                    "title": "Powered on VMs",
                    "value": jsonStr[i].powered_on_vms,
                    "short": true
                  },
                  {
                    "title": "VMC Version",
                    "value": jsonStr[i].vmc_version,
                    "short": true
                  },
                  {
                    "title": "VMC Internal Version",
                    "value": jsonStr[i].vmc_internal_version,
                    "short": true
                  },
                  {
                    "title": "Org ID",
                    "value": jsonStr[i].org_id,
                    "short": true
                  },
                  {
                    "title": "SDDC ID",
                    "value": jsonStr[i].sddc_id,
                    "short": true
                  }
                ],
              }]
            });
          }
        }
      });
    }
    if (action_id == 'extendPOC') {
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
            if (process.env.env_type == "set_dev") {
              var approvers = "<@U40TBNTTQ> <@U3U3D17MK> <@U3U3K6HM2>";
            } else {
              var approvers = "<@WAATAPVQD>";
            }
            var message_options = [
              "Hear ye hear ye, a request from " + real_name + " to extend " + customer + "'s POC has been requested. \n *" + extReq + "*  \n" + approvers + " do you approve? ",
              "Attention K-Mart shoppers, " + real_name + " has requested an extention for " + customer + ".  \n *" + extReq + "*  \n" + approvers + " do you approve?"
            ]
            var random_index = Math.floor(Math.random() * message_options.length);
            var chosen_message = message_options[random_index];
            bot.reply(message, "I will notify the approvers in the #vmc-poc-extensions channel.");
            bot.say({
              channel: "#vmc-poc-extensions",
              text: chosen_message
            });
            var jsonInput = {
              "event": "POC Extension Request",
              "userId": "bender@vmware.com",
              "properties": {
                "submitted_by": real_name,
                "account_name": customer,
                "reason": extReq
              }
            }

            valFunc.insertSegment(jsonInput, function(res) {
              console.log("segment response: " + res);
            });
            convo.next();
          });
        });
      };
      bot.startConversation(message, askExtReq);
    }
    if (action_id == 'showSFDC') {
      //get opp id
      valFunc.getSFDC(sfdc_id, "All", function(sfdc) {
        //don't ask me why
        var jsonParse = JSON.stringify(sfdc);
        var jsonStr = JSON.parse(jsonParse);
        if (jsonStr[0].opportunity_id !== null) {
          bot.reply(message, {
            text: "Here's what I found for " + customer,
            attachments: [{
              "title": "SFDC Opportunity Info",
              "color": "#629aca",
              "title": "VMware SalesForce",
              "title_link": "https://vmware.my.salesforce.com/" + sfdc_id,
              "fields": [{
                  "title": "Opportunity Name",
                  "value": jsonStr[0].oportunity_name,
                  "short": true
                },
                {
                  "title": "SF Opportunity ID",
                  "value": jsonStr[0].opportunity_number + "\n" + jsonStr[0].opportunity_id,
                  "short": true
                },
                {
                  "title": "Opportunity Type",
                  "value": jsonStr[0].record_type,
                  "short": true
                },
                {
                  "title": "Account Name",
                  "value": jsonStr[0].account_name,
                  "short": true
                },
                {
                  "title": "Stage",
                  "value": jsonStr[0].opportunity_stage,
                  "short": true
                },
                {
                  "title": "Opportunity Owner",
                  "value": jsonStr[0].opportunity_owner_name,
                  "short": true
                },
                {
                  "title": "Amount",
                  "value": jsonStr[0].opportunity_amount,
                  "short": true
                },
                {
                  "title": "Sales Territory",
                  "value": jsonStr[0].primary_field_sales_territory,
                  "short": true
                },
                {
                  "title": "Next Steps",
                  "value": jsonStr[0].next_steps_desc,
                  "short": false
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
      valFunc.selectCustomer(seName, searchType, function(res) {
        if (res.length == 0) {
          bot.reply(message, {
            text: "I couldn't find any info on " + seName + "."
          });
        } else {
          var jsonParse = JSON.stringify(res);
          var jsonStr = JSON.parse(jsonParse);

          for (var i = 0; i < jsonStr.length; i++) {
            if (jsonStr[i].actual_start_date == null) {
              var startDate = "None"
            } else {
              var startDate = jsonStr[i].actual_start_date.value
            }
            if (jsonStr[i].end_date == null) {
              var endDate = "None"
            } else {
              var endDate = jsonStr[i].end_date.value
            }

            bot.reply(message, {
              text: "Here's what I found for " + jsonStr[i].customer_name,
              attachments: [{
                "title": "Validation Tracker Info",
                "color": colorArray[i],
                //"title": "Mode Analytics Report",
                //"title_link": "https://modeanalytics.com/vmware_inc/reports/1c69ccf26a01",
                "fields": [{
                    "title": "Customer",
                    "value": jsonStr[i].customer_name,
                    "short": true
                  },
                  {
                    "title": "Status",
                    "value": jsonStr[i].status + " - " + jsonStr[i].type,
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
    valFunc.selectCustomer(customer, searchType, function(res) {
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
            text: "Here's what I found for " + jsonStr[i].customer_name,
            attachments: [{
              "title": "Validation Tracker Info",
              "color": colorArray[i],
              "title": "Mode Analytics Report",
              "title_link": "https://modeanalytics.com/vmware_inc/reports/e869ce5736c1",
              "fields": [{
                  "title": "Customer",
                  "value": jsonStr[i].customer_name,
                  "short": true
                },
                {
                  "title": "Status",
                  "value": jsonStr[i].status + " - " + jsonStr[i].type,
                  "short": true
                },
                {
                  "title": "SET Member",
                  "value": jsonStr[i].se_specialist,
                  "short": true
                },
                {
                  "title": "Use Cases",
                  "value": use_case,
                  "short": true
                },
                {
                  "title": "Start Date",
                  "value": jsonStr[i].expected_start_date,
                  "short": true
                },
                {
                  "title": "End Date",
                  "value": jsonStr[i].expected_end_date,
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
                  "value": jsonStr[i].org_id,
                  "short": true
                },
                {
                  "title": "CS Architect",
                  "value": jsonStr[i].cs_architect,
                  "short": true
                },
                {
                  "title": "Cloud Specialist",
                  "value": jsonStr[i].cloud_specialist,
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
                  "value": jsonStr[i].sfdc_oppty_id_raw, //https://vmware.my.salesforce.com/_ui/search/ui/UnifiedSearchResults?searchType=2&str=
                  "short": true
                },
                {
                  "title": "Notes",
                  "value": jsonStr[i].notes,
                  "short": false
                }
              ],
              callback_id: 'actions-select|' + customer + "|" + jsonStr[i].sfdc_oppty_id_raw + "|" + jsonStr[i].org_id,
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
}; /* the end */
