/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
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
let color = "#009cdb";

module.exports = function(controller) {

/*  this.setTimeout(60000 * 5);
  this.onTimeout(function(convo) {
    var message_options = [
      ":musical_note: All by myself....don't want to be....:musical_note:",
      "Hello? Did you forget about me????",
      "Apparently I'm not important enough for you, so I'm back to my hole."
    ]
    var random_index = Math.floor(Math.random() * message_options.length);
    var chosen_message = message_options[random_index];
    convo.say(chosen_message)
  })
*/

  controller.hears(['update (.*)'], 'direct_message, direct_mention,mention', function(bot, message) {
    let customer = message.match[1];
    var updateValue = "";
    var updateField = "";
    let askField = (response, convo) => {

      convo.ask({
        attachments: [{
          title: 'Which field do you want to update?',
          callback_id: 'uField',
          attachment_type: 'default',
          color: color,
          actions: [{
            "name": "uField",
            "text": "Pick a field...",
            "type": "select",
            "option_groups": fields.uFields()
          }]
        }]
      }, [{
        default: true,
        callback: function(response, convo) {
          updateField = response.text;
          console.log(response.text);
          getUpdate(response, convo);
          convo.next();
        }
      }]);
    };

    let getUpdate = (response, convo) => {
      switch (updateField) {
        case "SFDC_OPPTY_ID":
          convo.ask("What's the SalesForce Cloud Sales Opportunity ID? Example 0063400001BcitG", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "Customer_Name":
          convo.ask("What is the account's new name?", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "SE_Specialist":
          convo.ask("Name of the SET Member?", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "aws_resource":
          convo.ask("Name of the AWS resource assigned to " + customer + "?", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "Actual_Start_Date":
          convo.ask("Start Date? (mm/dd/yyyy)", (response, convo) => {
            console.log('start date: ' + isValidDate(response.text));
            if (isValidDate(response.text)) {
              updateValue = response.text;
              confTask(response, convo);
              convo.next();
            } else {
              convo.say('Oops looks like you entered the date wrong.  Try again.');
              convo.next();
            }
          });
          break;
        case "End_date":
          convo.ask("End Date? (mm/dd/yyyy)", (response, convo) => {
            console.log('end date: ' + isValidDate(response.text));
            if (isValidDate(response.text)) {
              updateValue = response.text;
              confTask(response, convo);
              convo.next();
            } else {
              convo.say('Oops looks like you entered the date wrong.  Try again.');
              convo.next();
            }
          });
          break;
        case "Cloud_Specialist":
          convo.ask("Who is the Cloud Specialist assigned to " + customer + "?", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "ORG_ID":
          convo.ask("OrgID?", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "refresh_token":
          convo.ask("Refresh Token?", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "Notes":
          convo.ask("Append additional notes (date will be added)", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "Status":
          convo.ask({
            attachments: [{
              title: 'What is the current status?',
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
              updateValue = response.text;
              confTask(response, convo);
              convo.next();
            }
          }]);
          break;
        case "Type":
          convo.ask({
            attachments: [{
              title: 'Is this a POC or Paid Pilot?',
              callback_id: 'type',
              attachment_type: 'default',
              color: color,
              actions: [{
                "name": "type",
                "text": "Type...",
                "type": "select",
                "options": fields.type()
              }]
            }]
          }, [{
            default: true,
            callback: function(response, convo) {
              updateValue = response.text;
              confTask(response, convo);
              convo.next();
            }
          }]);
          break;
        case "Compliance":
          convo.ask({
            attachments: [{
              title: 'What are the compliance requirement(s)?',
              callback_id: 'compType',
              attachment_type: 'default',
              color: color,
              actions: [{
                "name": "CompType",
                "text": "Compliance...",
                "type": "select",
                "options": fields.compliance()
              }]
            }]
          }, [{
            default: true,
            callback: function(response, convo) {
              updateValue = updateValue + response.text + '|';
              askCompRepeat(response, convo);
              convo.next();
            }
          }]);
          let askCompRepeat = (response, convo) => {

            convo.ask({
              attachments: [{
                title: 'Are there more compliance requirements?',
                callback_id: 'custType',
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
                  //askCompType(response, convo);
                  convo.ask({
                    attachments: [{
                      title: 'What are the compliance requirement(s)?',
                      callback_id: 'compType',
                      attachment_type: 'default',
                      color: color,
                      actions: [{
                        "name": "CompType",
                        "text": "Compliance...",
                        "type": "select",
                        "options": fields.compliance()
                      }]
                    }]
                  }, [{
                    default: true,
                    callback: function(response, convo) {
                      updateValue = updateValue + response.text + '|';
                      askCompRepeat(response, convo);
                      convo.next();
                    }
                  }]);
                  convo.next();

                }
              },
              {
                pattern: "no",
                callback: function(reply, convo) {
                  convo.say('Cool beans :coolbean:');
                  //compType = "NA";
                  confTask(response, convo);
                  convo.next();
                }
              },
              {
                default: true,
                callback: function(response, convo) {
                  // = response.text;
                  conf(response, convo);
                  convo.next();
                }
              }
            ]);
          };
          break;
        case "Use_Case":
          //askPriUC(response, convo);
          //let askPriUC = (response, convo) => {
          convo.ask({
            attachments: [{
              title: "What are " + customer + "'s use case(s)?",
              callback_id: 'use_case',
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
              updateValue = updateValue + response.text + "|";
              askUCRepeat(response, convo);
              convo.next();
            }
          }]);
          //};
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
                  //askPriUC(response, convo);
                  convo.ask({
                    attachments: [{
                      title: "What are " + customer + "'s use case(s)?",
                      callback_id: 'use_case',
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
                      updateValue = updateValue + response.text + "|";
                      askUCRepeat(response, convo);
                      convo.next();
                    }
                  }]);
                  convo.next();
                }
              },
              {
                pattern: "no",
                callback: function(reply, convo) {
                  convo.say('Cool beans :coolbean:');
                  //compType = "NA";
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
          break;
        case "Services":
          convo.ask({
            attachments: [{
              title: 'Which service(s) or add-on(s) will be installed for ' + customer,
              callback_id: 'services',
              attachment_type: 'default',
              color: color,
              actions: [{
                "name": "services",
                "text": "Pick a service...",
                "type": "select",
                "option_groups": fields.services()
              }]
            }]
          }, [{
            default: true,
            callback: function(response, convo) {
              updateValue = updateValue + response.text + '|';
              askServRepeat(response, convo);
              convo.next();
            }
          }]);

          let askServRepeat = (response, convo) => {

            convo.ask({
              attachments: [{
                title: 'Are there more services or add-ons?',
                callback_id: 'moreServ',
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
                  convo.ask({
                    attachments: [{
                      title: 'Which additional service(s) or add-on(s) will be installed for ' + customer,
                      callback_id: 'services',
                      attachment_type: 'default',
                      color: color,
                      actions: [{
                        "name": "services",
                        "text": "Pick a service...",
                        "type": "select",
                        "option_groups": fields.services()
                      }]
                    }]
                  }, [{
                    default: true,
                    callback: function(response, convo) {
                      updateValue = updateValue + response.text + '|';
                      askServRepeat(response, convo);
                      convo.next();
                    }
                  }]);
                  convo.next();
                }
              },
              {
                pattern: "no",
                callback: function(reply, convo) {
                  convo.say('Cool beans :coolbean:');
                  //compType = "NA";
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
          break;
        case "AWS_Region":
          convo.ask({
            attachments: [{
              title: 'Select the desired AWS region(s) for  ' + customer,
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
              updateValue = updateValue + response.text + '|';
              askRegRepeat(response, convo);
              convo.next();
            }
          }]);

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
                  convo.ask({
                    attachments: [{
                      title: 'Select the desired AWS region(s) for  ' + customer,
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
                      updateValue = updateValue + response.text + '|';
                      askRegRepeat(response, convo);
                      convo.next();
                    }
                  }]);
                  convo.next();
                }
              },
              {
                pattern: "no",
                callback: function(reply, convo) {
                  convo.say('Cool beans :coolbean:');
                  //compType = "NA";
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
          break;

          //consumption plan fields
        case "CS_Architect":
          convo.ask("Who is the Customer Success assigned to " + customer + "?", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "CS_Manager":
          convo.ask("Who is the Customer Success Manager assigned to " + customer + "?", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "Customer_Email":
          convo.ask("What is the main contact customer email?", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "current_host_count":
          convo.ask("Number of hosts (today)", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "expected_num_hosts":
          convo.ask("Expected number of hosts (12 months)", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "vmc_reference":
          convo.ask("VMC Reference (Yes/no/maybe)", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "oppty_close_date":
          convo.ask("Opportunity Close Date (mm/dd/yyyy)", (response, convo) => {
            console.log('opp close date: ' + isValidDate(response.text));
            if (isValidDate(response.text)) {
              updateValue = response.text;
              confTask(response, convo);
              convo.next();
            } else {
              convo.say('Oops looks like you entered the date wrong.  Try again.');
              convo.next();
            }
          });
          break;
        case "est_onboarding_date":
          convo.ask("Estimated onboarding start (mm/dd/yyyy)", (response, convo) => {
            console.log('est date: ' + isValidDate(response.text));
            if (isValidDate(response.text)) {
              updateValue = response.text;
              confTask(response, convo);
              convo.next();
            } else {
              convo.say('Oops looks like you entered the date wrong.  Try again.');
              convo.next();
            }
          });
          break;
        case "est_go_live_date":
          convo.ask("Launch/completion date (mm/dd/yyyy)", (response, convo) => {
            console.log('launch date: ' + isValidDate(response.text));
            if (isValidDate(response.text)) {
              updateValue = response.text;
              confTask(response, convo);
              convo.next();
            } else {
              convo.say('Oops looks like you entered the date wrong.  Try again.');
              convo.next();
            }
          });
          break;
        case "customer_requirements":
          convo.ask("Customer requirements", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
        case "use_case_scenario":
          convo.ask("Use case scenario????", (response, convo) => {
            updateValue = response.text;
            confTask(response, convo);
            convo.next();
          });
          break;
          //
      }
      //update the fields in bigquery
      console.log("done with case");
    };

    let confTask = (response, convo) => {
      //update info
      if (response.text === 'cancel') {
        convo.say('Okay');
        convo.next();
      } else {
        updateCustomer(customer, updateField, updateValue, function(res) {
          console.log("response: " + res);
          if (res == 0) {
            bot.reply(message, {
              text: "I couldn't find any info on " + customer + " or the the update failed."
            });
          } else {
            bot.reply(message, {
              text: "Your info has been updated!"
            });
          }
          //let us know if more fields need to be updated if marked complete won.
          if (updateValue == 'Complete Won') {
            bot.reply(message, {
              text: "Make sure to fill out the consumption plan fields for Customer Success Team using `@bender update " + customer + "`."
            });
            bot.say({
              channel: "#vmc-tech-validation",
              text: customer + " has been updated as a win!"
            });
          }
          //make sure SDDC is deleted when status marked complete*
          if (updateField.indexOf("Complete") > -1) {
            bot.reply(message, {
              text: "Please make sure to delete the SDDC as part of the POC wrap up."
            });
          }
          //ask if you want to update another field
          convo.ask({
            attachments: [{
              title: 'Do you have more fields to update?',
              callback_id: 'updateMore',
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
                askField(response, convo);
                convo.next();
                // do something awesome here.
              }
            },
            {
              pattern: "no",
              callback: function(reply, convo) {
                convo.say('Buh bye');
                //askStatus(response, convo);
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
        }); //end of function
      }
    };
    //check to see if customer is already in tech validation table
    valFunc.getCustomer(customer, function(res) {
      if (res[0].result.indexOf("Yes") >= 0) {
        bot.startConversation(message, askField);
      } else {
        bot.reply(message, "I can't find " + customer + ". Use `@bender get " + customer + "` to get more information.  Also try using the exact customer name entered into tech validation.")
      }
    });
  });

  //function to get customer tracker information
  function updateCustomer(customer, updateField, updateValue, callback) {
    // Imports the mssql query
    let sqlQuery;
    customer = customer.toLowerCase();
    customer = customer.replace("*", "%");
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

    var upDate = mm + '/' + dd + '/' + yyyy;

    // Update val tracker
    if (updateField == 'Notes') {
      updateValue = updateValue.replace("'", "''");
      sqlQuery = `UPDATE dbo.tech_validation
          SET notes = CONCAT(notes, CHAR(13),CAST(CONVERT(date, getdate()) as nvarchar),'-', '${updateValue}')
              ,date_updated = '${upDate}'
          WHERE lower(customer_name) like '${customer}'`;
    } else if (updateField == 'Use_Case' || updateField == 'Compliance' || updateField == 'AWS_Region' || updateField == 'Services') {
      sqlQuery = `EXECUTE [dbo].[tech_validation_upsert_sp]
                  '${customer}'
                  ,'${updateField}'
                  ,'${updateValue}'`;
    } else {
      sqlQuery = `UPDATE dbo.tech_validation
          SET ${updateField} = '${updateValue}'
              ,date_updated = '${upDate}'
          WHERE lower(customer_name) like '${customer}'`;
    }
    console.log("query-" + sqlQuery);
    sql.connect(config, err => {
      console.log("connect error: " + err);

      // Query

      new sql.Request().query(sqlQuery, (err, result) => {
        // ... error checks
        sql.close();
        if (!err) {
          console.log(result.rowsAffected);
          return callback(result.rowsAffected);
        } else {
          return callback(0);
        }
      })

    })

    sql.on('error', err => {
      console.log("on error:" + err);
    })
  }
  //check date format function
  function isValidDate(s) {
    var sp = s + '';
    var bits = sp.split('/');
    var y = bits[2],
      m = bits[0],
      d = bits[1];
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
