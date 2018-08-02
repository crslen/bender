/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
var valFunc = require('../model/valFunctions');
const sql = require('mssql');
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
    var action_id = message.actions[0].value;

    if (action_id == 'select-poc' || action_id == 'Yes-poc') {
      var ids = message.callback_id.split('|');
      var customer = ids[1];
      var sfOpp = ids[2];
      var custType = ids[3];
      var partType = custType.toLowerCase();
      console.log("callback: " + message.callback_id);
      console.log("action: " + action_id);

      var customer; //customer name
      var sfOpp; //SalesForce ID
      var seName; //set se
      var partnerName = ""; //partner name for POC's
      var priUC = ""; //primary use case
      var depReg = ""; //
      var compType = ""; //compliance requirements
      var servType = ""; //services and add-ons
      var statusType; //status
      var startDate = ""; //start Date
      var endDate = ""; //end Date
      var notes; //notes and next Steps
      var orgId = ""; //orgID
      let css; //Cloud Sales Specialist
      let custEmail; //customer email
      let color = "#009cdb";

      let askPartner = (response, convo) => {

        convo.ask("What is the partner name involved with " + customer + "?", (response, convo) => {
          partnerName = response.text;
          askPriUC(response, convo);
          convo.next();
        });
      };

      let askOpp = (response, convo) => {

        convo.ask("What's the SalesForce Cloud Sales Opportunity ID? Example 0063400001BcitG", (response, convo) => {
          sfOpp = response.text;
          askPriUC(response, convo);
          convo.next();
        });
      };

      let askPriUC = (response, convo) => {

        convo.ask({
          attachments: [{
            title: "What are " + customer + "'s use case(s)?",
            callback_id: 'primary_use_case',
            attachment_type: 'default',
            color: color,
            actions: [{
              "name": "use_case",
              "text": "Pick a use case...",
              "type": "select",
              "options": fields.useCases()
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            priUC = priUC + response.text + "|";
            askUCRepeat(response, convo);
            convo.next();
          }
        }]);
      };

      let askUCRepeat = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Are there more use cases?',
            callback_id: 'moreUC',
            attachment_type: 'default',
            color: color,
            actions: [{
                "name": "yes",
                "text": "Yes",
                "value": "Yes",
                "type": "button",
              },
              {
                "name": "no",
                "text": "No",
                "value": "No",
                "type": "button",
              }
            ]
          }]
        }, [{
            pattern: "yes",
            callback: function(reply, convo) {
              askPriUC(response, convo);
              convo.next();
              // do something awesome here.
            }
          },
          {
            pattern: "no",
            callback: function(reply, convo) {
              convo.say('Cool beans :coolbean:');
              //compType = "NA";
              askDepReg(response, convo);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              // = response.text;
              askStatus(response, convo);
              convo.next();
            }
          }
        ]);
      };

      let askDepReg = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Select the desired AWS region(s) for ' + customer,
            callback_id: 'deployRegion',
            attachment_type: 'default',
            color: color,
            actions: [{
              "name": "deployRegion",
              "text": "Pick a region...",
              "type": "select",
              "option_groups": fields.awsRegions()
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            depReg = depReg + response.text + "|";
            askRegRepeat(response, convo);
            convo.next();
          }
        }]);
      };

      let askRegRepeat = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Are there more regions?',
            callback_id: 'moreReg',
            attachment_type: 'default',
            color: color,
            actions: [{
                "name": "yes",
                "text": "Yes",
                "value": "Yes",
                "type": "button",
              },
              {
                "name": "no",
                "text": "No",
                "value": "No",
                "type": "button",
              }
            ]
          }]
        }, [{
            pattern: "yes",
            callback: function(reply, convo) {
              askDepReg(response, convo);
              convo.next();
              // do something awesome here.
            }
          },
          {
            pattern: "no",
            callback: function(reply, convo) {
              convo.say(fields.yayMessage());
              //compType = "NA";
              askComp(response, convo);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              // = response.text;
              askStatus(response, convo);
              convo.next();
            }
          }
        ]);
      };

      let askComp = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Are there compliance requirements?',
            callback_id: 'compliance',
            attachment_type: 'default',
            color: color,
            actions: [{
                "name": "yes",
                "text": "Yes",
                "value": "Yes",
                "type": "button",
              },
              {
                "name": "no",
                "text": "No",
                "value": "No",
                "type": "button",
              }
            ]
          }]
        }, [{
            pattern: "yes",
            callback: function(reply, convo) {
              askCompType(response, convo);
              convo.next();
              // do something awesome here.
            }
          },
          {
            pattern: "no",
            callback: function(reply, convo) {
              convo.say('Ok good to know');
              compType = "NA";
              askServType(response, convo);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              // = response.text;
              confTask(response, convo);
              convo.next();
            }
          }
        ]);
      };

      let askCompType = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'What are the compliance requirement(s) for ' + customer,
            callback_id: 'compType',
            attachment_type: 'default',
            color: color,
            actions: [{
              "name": "compType",
              "text": "Compliance...",
              "type": "select",
              "options": fields.compliance()
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            compType = compType + response.text + "|";
            askCompRepeat(response, convo);
            convo.next();
          }
        }]);
      };

      let askCompRepeat = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Are there more compliance requirements?',
            callback_id: 'moreCompliance',
            attachment_type: 'default',
            color: color,
            actions: [{
                "name": "yes",
                "text": "Yes",
                "value": "Yes",
                "type": "button",
              },
              {
                "name": "no",
                "text": "No",
                "value": "No",
                "type": "button",
              }
            ]
          }]
        }, [{
            pattern: "yes",
            callback: function(reply, convo) {
              askCompType(response, convo);
              convo.next();
              // do something awesome here.
            }
          },
          {
            pattern: "no",
            callback: function(reply, convo) {
              convo.say(fields.yayMessage());
              //compType = "NA";
              askServType(response, convo);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              // = response.text;
              askStatus(response, convo);
              convo.next();
            }
          }
        ]);
      };

      let askService = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Will there be services or add-ons included?',
            callback_id: 'services',
            attachment_type: 'default',
            color: color,
            actions: [{
                "name": "yes",
                "text": "Yes",
                "value": "Yes",
                "type": "button",
              },
              {
                "name": "no",
                "text": "No",
                "value": "No",
                "type": "button",
              }
            ]
          }]
        }, [{
            pattern: "yes",
            callback: function(reply, convo) {
              askServType(response, convo);
              convo.next();
              // do something awesome here.
            }
          },
          {
            pattern: "no",
            callback: function(reply, convo) {
              convo.say('Ok good to know');
              compType = "NA";
              askStatus(response, convo);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              // = response.text;
              confTask(response, convo);
              convo.next();
            }
          }
        ]);
      };

      let askServType = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Which service(s) or add-on(s) will be installed for ' + customer,
            callback_id: 'servType',
            attachment_type: 'default',
            color: color,
            actions: [{
              "name": "servType",
              "text": "Services...",
              "type": "select",
              "option_groups": fields.services()
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            servType = servType + response.text + "|";
            if (servType.indexOf("None") >= 0) {
              askStatus(response, convo);
            } else {
              askServRepeat(response, convo);
            }
            convo.next();
          }
        }]);
      };

      let askServRepeat = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Are there more services or add-ons?',
            callback_id: 'moreServices',
            attachment_type: 'default',
            color: color,
            actions: [{
                "name": "yes",
                "text": "Yes",
                "value": "Yes",
                "type": "button",
              },
              {
                "name": "no",
                "text": "No",
                "value": "No",
                "type": "button",
              }
            ]
          }]
        }, [{
            pattern: "yes",
            callback: function(reply, convo) {
              askServType(response, convo);
              convo.next();
              // do something awesome here.
            }
          },
          {
            pattern: "no",
            callback: function(reply, convo) {
              convo.say('Keep going, you are almost there!');
              //compType = "NA";
              askStatus(response, convo);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              // = response.text;
              askStatus(response, convo);
              convo.next();
            }
          }
        ]);
      };

      let askStatus = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'What is the current status of ' + custType,
            callback_id: 'status',
            attachment_type: 'default',
            color: color,
            actions: [{
              "name": "status",
              "text": "Current Status...",
              "type": "select",
              "options": fields.status()
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            statusType = response.text;
            askStartEnd(response, convo);
            convo.next();
          }
        }]);
      };
      let askStartEnd = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Do you have an expected start and end date?',
            callback_id: 'dateType',
            attachment_type: 'default',
            color: color,
            actions: [{
                "name": "yes",
                "text": "Yes",
                "value": "Yes",
                "type": "button",
              },
              {
                "name": "no",
                "text": "No",
                "value": "No",
                "type": "button",
              }
            ]
          }]
        }, [{
            pattern: "yes",
            callback: function(reply, convo) {
              askStartDate(response, convo);
              convo.next();
              // do something awesome here.
            }
          },
          {
            pattern: "no",
            callback: function(reply, convo) {
              convo.say('Ok make sure you update start and end date once confirmed with your customer by typing `@bender update ' + customer + '`');
              startDate = null;
              endDate = null;
              askNotes(response, convo);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              // = response.text;
              confTask(response, convo);
              convo.next();
            }
          }
        ]);
      };

      let askStartDate = (response, convo) => {

        convo.ask("Expected start date? (mm/dd/yyyy)", (response, convo) => {
          startDate = "'" + response.text + "'";
          askEndDate(response, convo);
          convo.next();
        });
      };

      let askEndDate = (response, convo) => {

        convo.ask("Expected end date? (mm/dd/yyyy)", (response, convo) => {
          endDate = "'" + response.text + "'";
          askNotes(response, convo);
          convo.next();
        });
      };

      let askNotes = (response, convo) => {

        convo.ask("Please provide the details of " + custType + " and next steps", (response, convo) => {
          notes = response.text;
          askOrgInvite(response, convo);
          convo.next();
        });
      };

      let askOrgInvite = (response, convo) => {

        convo.ask({
          attachments: [{
            title: 'Do you have the org ID?',
            callback_id: 'reqOrg',
            attachment_type: 'default',
            color: color,
            actions: [{
                "name": "yes",
                "text": "Yes",
                "value": "yes",
                "type": "button",
              },
              {
                "name": "no",
                "text": "No",
                "value": "no",
                "type": "button",
              }
            ]
          }]
        }, [{
            pattern: "yes",
            callback: function(reply, convo) {
              askOrg(response, convo);
              convo.next();
              // do something awesome here.
            }
          },
          {
            pattern: "no",
            callback: function(reply, convo) {
              convo.say('Ok when you are ready for an invite ask `@bender create new org` to generate a new invite');
              orgId = "";
              confTask(response, convo);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              // = response.text;
              confTask(response, convo);
              convo.next();
            }
          }
        ]);
      };

      let askOrg = (response, convo) => {

        convo.ask("Please enter the Org ID.", (response, convo) => {
          orgId = response.text;
          confTask(response, convo);
          convo.next();
        });
      };

      let confTask = (response, convo) => {
        //convo.setVar('createorg', getInvite(function(rToken){}));
        //get the user name that's submitting the info
        bot.api.users.info({
          user: message.user
        }, (error, response) => {
          let {
            name,
            real_name
          } = response.user;
          console.log(name, real_name);

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

          var estDate = mm + '/' + dd + '/' + yyyy;

          var rows = "'" + sfOpp + "','" +
            customer + "','" +
            partnerName + "','" +
            custType + "','" +
            real_name + "','" +
            priUC + "','" +
            depReg + "','" +
            compType + "','" +
            servType + "','" +
            statusType + "','" +
            estDate + "','" +
            estDate + "'," +
            startDate + "," +
            endDate + ",'" +
            notes + "','" +
            orgId + "'";

          var jsonInput = {
            "event": "Tech Validation",
            "userId": "bender@vmware.com",
            "properties": {
              "sfdc_oppty_id_raw": sfOpp,
              "customer_name": customer,
              "partner_name": partnerName,
              "type": custType,
              "se_specialist": real_name,
              "use_case": priUC,
              "region": depReg,
              "compliance": compType,
              "service": servType,
              "status": statusType,
              "datetime_inserted": estDate,
              "datetime_updated": estDate,
              "est_start_date": startDate,
              "est_end_date": endDate,
              "notes": notes,
              "cs_architect": null,
              "cloud_specialist": null,
              "customer_email": null,
              "expected_num_hosts": null,
              "current_host_count": null,
              "vmc_reference": null,
              "oppty_close_date": null,
              "est_onboarding_date": null,
              "est_go_list_date": null,
              "customer_requirements": null,
              "CS_Manager": null,
              "aws_resource": null,
              "org_id": orgId
            }
          }

          valFunc.insertSegment(jsonInput, function(res) {
            console.log("segment response: " + res);
          });

          insertRowsAsStream(rows, function(res) {
            if (res == 0) {
              bot.reply(message, {
                text: customer + " was not added for whatever reason."
              });
            } else {
              bot.reply(message, {
                text: "Your info has been added and will be available to view within the *next hour*. I've also set a reminder for you to make updates for " + customer + " on Tuesdays and Fridays.\nTo delete the reminder just type `/remind list`"
              });
              bot.api.users.info({
                user: message.user
              }, (error, response) => {
                let {
                  id,
                  name,
                  real_name
                } = response.user;
                console.log(id, name, real_name);
                bot.api.reminders.add({
                  token: process.env.OAUTH_ACCESS_TOKEN,
                  text: "<@" + id + "> Interact with Bender to update validation tracker for " + customer + ".",
                  time: "Tuesdays and Fridays",
                  channel: process.env.poc_channel
                }, (error, response) => {
                  console.log(error, response);
                })
              })
            }
            bot.say({
              channel: "#vmc-tech-validation",
              text: "A new " + custType + " entry for " + customer + " has been added to the tech validation tracker."
            });
          });
        })
      };

      //check to see if customer is already in tech validation table
      valFunc.getCustomer(customer, function(res) {
        if (res.length == 0) {
          bot.reply(message, "OK, I can help you with that! I will need to ask some questions to add to the validation tracker database.");
          if (partType.indexOf("partner") >= 0) {
            bot.startConversation(message, askPartner);
          } else {
            bot.startConversation(message, askPriUC);
          }
        } else {
          bot.reply(message, "Looks like there's already an entry in the Tech Validation database for " + customer + ". Use `@bender get " + customer + "` to get more information.")
        }
      });
    } else {
      bot.reply(message, "Ok be that way. Byeee");
    }

  });

  controller.hears(['new (.*) for (.*)', 'add (.*) for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    valFunc.validateUser(bot, message, function(cb) {
      if (cb == 1) {
        var custType = message.match[1];
        var customer = message.match[2];

        //make sure we are entering a valid entry
        if (custType.toLowerCase() == 'paid pilot' || custType.toLowerCase() == 'poc' || custType.toLowerCase() == 'partner poc' || custType.toLowerCase() == 'pilot') {

          bot.reply(message, {
            text: "Searching opportunities for " + customer + "....."
          });

          valFunc.getSFDC(customer, null, function(res) {
            if (res.length == 0) {
              bot.reply(message, {
                text: "I couldn't find any opportunities for " + customer + " :shocked:"
              });
              bot.reply(message, {
                attachments: [{
                  title: 'You still want to enter a new entry?',
                  callback_id: 'actions-poc|' + customer + "|null|" + custType,
                  attachment_type: 'default',
                  actions: [{
                      "name": "yes",
                      "text": "Yes",
                      "value": "Yes-poc",
                      "type": "button",
                    },
                    {
                      "name": "no",
                      "text": "No",
                      "value": "No-poc",
                      "type": "button",
                    }
                  ]
                }]
              });
            } else {
              var jsonParse = JSON.stringify(res);
              console.log("return: " + jsonParse);
              var jsonStr = JSON.parse(jsonParse);
              bot.reply(message, "If possible select a Cloud Opportunity");

              for (var i = 0; i < jsonStr.length; i++) {

                var sfMessage = '' +
                  '*Account Name:* ' + jsonStr[i].account_name + '\n' +
                  '*Opportunity ID:* ' + jsonStr[i].opportunity_id + ' or ' + jsonStr[i].opportunity_name + '\n' +
                  '*Opportunity Type:* ' + jsonStr[i].record_type + '\n' +
                  '*Stage:* ' + jsonStr[i].opportunity_stage + '\n' +
                  '*Date Created:* ' + jsonStr[i].opportunity_create_date + '\n' +
                  '*Opportunity Owner:* ' + jsonStr[i].opportunity_owner_name + '\n';

                bot.reply(message, {
                  //text: "Here's what I found for " + customer,
                  attachments: [{
                    "text": sfMessage,
                    callback_id: 'actions-poc|' + jsonStr[i].account_name + "|" + jsonStr[i].opportunity_id + "|" + custType,
                    actions: [{
                      "name": "select",
                      "text": "Select",
                      "value": "select-poc",
                      "type": "button",
                    }],
                  }]
                });
              }
            }
          });
        } else {
          bot.reply(message, {
            text: "Looks like you didn't enter a valid tech validation type.  Try again."
          });
        }
      } else {
        bot.reply(message, "Sorry you do not have access to perform this operation.");
      }
    });
  });

  /*  function to insert data into sql server */
  function insertRowsAsStream(rows, callback) {
    // Imports the mssql query
    let sqlQuery;

    // insert val tracker
    sqlQuery = `EXECUTE [dbo].[tech_validation_insert_sp]
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

  //check date format
  function isValidDate(s) {
    var bits = s.split('/');
    var y = bits[2],
      m = bits[1],
      d = bits[0];
    // Assume not leap year by default (note zero index for Jan)
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // If evenly divisible by 4 and not evenly divisible by 100,
    // or is evenly divisible by 400, then a leap year
    if ((!(y % 4) && y % 100) || !(y % 400)) {
      daysInMonth[1] = 29;
    }
    return !(/\D/.test(String(d))) && d > 0 && d <= daysInMonth[--m]
  }

}; /* the end */
