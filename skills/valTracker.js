/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
let fields = require("../json/valFields");

module.exports = function(controller) {

    /* Collect some very simple runtime stats for use in the uptime/debug command */
    var stats = {
        triggers: 0,
        convos: 0,
    }

    controller.on('heard_trigger', function() {
        stats.triggers++;
    });

    controller.on('conversationStarted', function() {
        stats.convos++;
    });


    controller.hears(['new (.*) for (.*)', 'add (.*) for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

      var customer; //customer name
      var sfOpp; //SalesForce ID
      var custType; //poc or paidpilot
      var seName; //set se
      var priUC; //primary use case
      var secUC; //secondary use case
      var triUC;  //tertiary use case
      var DepReg; //
      var desiredReg; //desired region
      var compType; //compliance requirements
      var statusType; //status
      var startDate; //start Date
      var endDate; //end Date
      var notes; //notes and next Steps
      var orgId; //orgID
      let css;//Cloud Sales Specialist
      let custEmail; //customer email
      let color = "#009cdb";

      var custType = message.match[1];
      var customer = message.match[2];

      let askOpp = (response, convo) => {

        convo.ask("What's the SalesForce Opportunity ID?", (response, convo) => {
            sfOpp = response.text;
            askPriUC(response, convo);
            convo.next();
        });
      };

  let askPriUC = (response, convo) => {

            convo.ask({
              attachments: [
                            {
                                title: "What is " + customer + "'s primary use case?",
                                callback_id: 'primary_use_case',
                                attachment_type: 'default',
                                color: color,
                                actions: [
                                    {
                                        "name":"primary_use_case",
                                        "text": "Pick a use case...",
                                        "type": "select",
                                        "options": fields.useCases()
                                      }
                                  ]
                              }
                          ]
                  },[
                    {
                      default: true,
                    callback: function(response, convo) {
                      priUC = response.text;
                      askSecUC(response, convo);
                      convo.next();
                    }
                  }
                  ]);
              };

  let askSecUC = (response, convo) => {

            convo.ask({
              attachments:[
                          {
                              title: "What is " + customer + "'s secondary use case?",
                              callback_id: 'secondary_use_case',
                              attachment_type: 'default',
                              color: color,
                              actions: [
                                  {
                                      "name":"Secondary_Use_Case",
                                      "text": "Pick a use case...",
                                      "type": "select",
                                      "options": fields.useCases()
                                  }
                              ]
                          }
                      ]
                  },[
                    {
                      default: true,
                    callback: function(response, convo) {
                      secUC = response.text;
                      askDepReg(response, convo);
                      convo.next();
                    }
                  }
                  ]);
              };
  let askTriUC = (response, convo) => {

            convo.ask({
              attachments:[
                          {
                              title: "What is " + customer + "'s tertiary use case?",
                              callback_id: 'tertiary_use_case',
                              attachment_type: 'default',
                              color: color,
                              actions: [
                                  {
                                      "name":"tertiary_use_case",
                                      "text": "Pick a use case...",
                                      "type": "select",
                                      "options": fields.useCases()
                                  }
                              ]
                          }
                      ]
                  },[
                    {
                      default: true,
                    callback: function(response, convo) {
                      triUC = response.text;
                      askDepReg(response, convo);
                      convo.next();
                    }
                  }
                  ]);
              };

  let askDepReg = (response, convo) => {

    convo.ask({
      attachments:[
                  {
                      title: 'Region SDDC is deploying for ' + custType,
                      callback_id: 'deployRegion',
                      attachment_type: 'default',
                      color: color,
                      actions: [
                          {
                              "name":"deployRegion",
                              "text": "Pick a region...",
                              "type": "select",
                              "options": fields.awsRegions()
                          }
                      ]
                  }
              ]
          },[
            {
              default: true,
            callback: function(response, convo) {
              depReg = response.text;
              askDesReg(response, convo);
              convo.next();
            }
          }
          ]);
      };

      //ask where poc or pilot will be deployed
      let askDesReg = (response, convo) => {

        convo.ask({
          attachments:[
                      {
                          title: 'Desired region?',
                          callback_id: 'deployRegion',
                          attachment_type: 'default',
                          color: color,
                          actions: [
                              {
                                  "name":"deployRegion",
                                  "text": "Pick a region...",
                                  "type": "select",
                                  "options": fields.awsRegions()
                              }
                          ]
                      }
                  ]
              },[
                {
                  default: true,
                callback: function(response, convo) {
                  desiredReg = response.text;
                  askComp(response, convo);
                  convo.next();
                }
              }
              ]);
          };

          let askComp = (response, convo) => {

                convo.ask({
                          attachments:[
                                      {
                                          title: 'Are there compliance requirements?',
                                          callback_id: 'custType',
                                          attachment_type: 'default',
                                          color: color,
                                          actions: [
                                              {
                                                  "name":"yes",
                                                  "text": "Yes",
                                                  "value": "Yes",
                                                  "type": "button",
                                              },
                                              {
                                                  "name":"no",
                                                  "text": "No",
                                                  "value": "No",
                                                  "type": "button",
                                              }
                                          ]
                                      }
                                  ]
                              },[
                                {
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

        let askCompType = (response, convo) => {

          convo.ask({
            attachments:[
                        {
                            title: 'What is the primary compliance requirement for ' + customer,
                            callback_id: 'compType',
                            attachment_type: 'default',
                            color: color,
                            actions: [
                                {
                                    "name":"compType",
                                    "text": "Compliance...",
                                    "type": "select",
                                    "options": fields.compliance()
                                }
                            ]
                        }
                    ]
                },[
                  {
                    default: true,
                  callback: function(response, convo) {
                    compType = response.text;
                    askStatus(response, convo);
                    convo.next();
                  }
                }
                ]);
            };

            let askStatus = (response, convo) => {
//ACTIVE, ON TRACK, PLANNING, WAITING ON FUNCTIONALITY, WAITING ON AWS REGION, CUSTOMER HOLD, COMPLETE - WON, COMPLETE - LOST, ON HOLD, AT RISK
              convo.ask({
                attachments:[
                            {
                                title: 'What is the current status of ' + custType,
                                callback_id: 'status',
                                attachment_type: 'default',
                                color: color,
                                actions: [
                                    {
                                        "name":"status",
                                        "text": "Current Status...",
                                        "type": "select",
                                        "options": fields.status()
                                    }
                                ]
                            }
                        ]
                    },[
                      {
                        default: true,
                      callback: function(response, convo) {
                        statusType = response.text;
                        askStartEnd(response, convo);
                        convo.next();
                      }
                    }
                    ]);
                };
      let askStartEnd = (response, convo) => {

            convo.ask({
                      attachments:[
                                  {
                                      title: 'Do you have an expected start and end date?',
                                      callback_id: 'dateType',
                                      attachment_type: 'default',
                                      color: color,
                                      actions: [
                                          {
                                              "name":"yes",
                                              "text": "Yes",
                                              "value": "Yes",
                                              "type": "button",
                                          },
                                          {
                                              "name":"no",
                                              "text": "No",
                                              "value": "No",
                                              "type": "button",
                                          }
                                      ]
                                  }
                              ]
                          },[
                            {
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
                                  convo.say('Ok make sure you update start and end date once confirmed with your customer by typing "@bender update ' + customer + '"');
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

        convo.ask("Expected start date? (mm-dd-yyyy)", (response, convo) => {
            startDate = "'" + response.text + "'";
            askEndDate(response, convo);
            convo.next();
        });
    };

    let askEndDate = (response, convo) => {

        convo.ask("Expected end date? (mm-dd-yyyy)", (response, convo) => {
            endDate = "'" + response.text + "'";
            askNotes(response, convo);
            convo.next();
        });
    };

    let askNotes = (response, convo) => {

        convo.ask("Details of " + custType + " and next steps", (response, convo) => {
            notes = response.text;
            if(custType = "POC"){
              askOrgInvite(response, convo);
            } else {
              askOrg(response, convo);
            }
            convo.next();
        });
    };

    let askOrgInvite = (response, convo) => {

      convo.ask({
                attachments:[
                            {
                                title: 'Do you need an invite to create a new Org?',
                                callback_id: 'reqOrg',
                                attachment_type: 'default',
                                color: color,
                                actions: [
                                    {
                                        "name":"yes",
                                        "text": "Yes",
                                        "value": "Yes",
                                        "type": "button",
                                    },
                                    {
                                        "name":"no",
                                        "text": "No",
                                        "value": "No",
                                        "type": "button",
                                    }
                                ]
                            }
                        ]
                    },[
                      {
                        pattern: "yes",
                        callback: function(reply, convo) {
                          getInvite(function(url) {
                            bot.reply(message, {
                            text: "Here's the invite for " + customer + " - " + url + "\n Click on the invite link to create the new org.  Make sure to capture the Org ID to update tech validation tracker."
                            });
                          });
                            askOrg(response, convo);
                            convo.next();
                            // do something awesome here.
                        }
                    },
                    {
                        pattern: "no",
                        callback: function(reply, convo) {
                            convo.say('Ok when you are ready for an invite ask "@bender create new org" to generate a new invite');
                            orgId = "";
                            askOrg(response, convo);
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

    convo.ask(custType + " OrgID?  If you don't have it you can update it later.", (response, convo) => {
        orgId = response.text;
        confTask(response, convo);
        convo.next();
      });
    };

    let confTask = (response, convo) => {
      //convo.setVar('createorg', getInvite(function(rToken){}));
        //get the user name that's submitting the info
        bot.api.users.info({user: message.user}, (error, response) => {
          let {name, real_name} = response.user;
          console.log(name, real_name);

          //get date in mm/dd/yyyy format
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!
          var yyyy = today.getFullYear();

          if(dd<10) {
              dd = '0'+dd
          }

          if(mm<10) {
              mm = '0'+mm
          }

          var estDate = mm + '/' + dd + '/' + yyyy;

          var rows = "('" + sfOpp + "','"
                      + customer + "','"
                      + custType + "','"
                      + real_name + "','"
                      + priUC + "','"
                      + secUC + "','"
                      + depReg + "','"
                      + desiredReg + "','"
                      + compType + "','"
                      + statusType + "','"
                      + estDate + "','"
                      + estDate + "',"
                      + startDate + ","
                      + endDate + ",'"
                      + notes + "','"
                      + orgId + "',0)";
          //convo.say("Here's what I gathered: " + inputRes);
          //convo.say("Thanks for the input :smile:  Your " + custType + " information for " + customer + " has been added to Mode Analytics (not really).");
           //const rows = JSON.parse(inputRes);
           insertRowsAsStream(rows, function(res) {
             if (res == 0) {
               bot.reply(message, {
                 text: customer + " was not added for whatever reason."
               });
             }
             else {
               bot.reply(message, {
                 text: "Your info has been added!"
               });
             }
             bot.say({
                 channel: "#tech-validation",
                 text: "A new entry for " + customer + " has been added to the tech validation tracker."
             });
           });
        })
    };

    bot.reply(message, "OK, I can help you with that! I will need to ask some questions to add to the validation tracker database.");
    bot.startConversation(message, askOpp);

});
/*  function to insert data into bigquery */
function insertRowsAsStream(rows, callback) {
  // Imports the mssql query
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
  let sqlQuery;

  // insert val tracker
    sqlQuery = `INSERT INTO [dbo].[pocs_and_pilots]
           ([SFDC_OPPTY_ID]
           ,[Customer_Name]
           ,[Type]
           ,[SE_Specialist]
           ,[Primary_Use_Case]
           ,[Secondary_Use_Case]
           ,[Primary_AWS_Region]
           ,[Secondary_AWS_Region]
           ,[Compliance]
           ,[Status]
           ,[Date_Inserted]
           ,[date_updated]
           ,[Actual_Start_Date]
           ,[End_Date]
           ,[Notes]
           ,[ORG_ID]
           ,[id])
     VALUES ${rows}`;
 console.log(sqlQuery);
  sql.connect(config, err => {
      // Query
      new sql.Request().query(sqlQuery, (err, result) => {
          // ... error checks
          sql.close();
          console.log(result, err)
          if(err == null) {
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

  /* Utility function to get invite to create org */
  function getInvite(callback) {
  var request = require('request');
  //get auth token
  request.post({
  headers: {"Content-Type" : "application/x-www-form-urlencoded", "Accept": "application/json"},
  form: {"refresh_token": "6163a32c-b7e5-4fad-b675-e7492b7141eb"},
  url:     "https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize"
  }, function(error, response, body){
  var jsonStr = JSON.parse(body);
  var rToken = jsonStr.access_token;
  //return callback(rToken);
  //request org invitation url
  var request = require('request');
  //console.log(rToken);
  request.post({
   headers: {'csp-auth-token': rToken, 'Content-Type': 'application/json'},
   json: {"preset_name":  "CUSTOMER",
           "number_of_invitations": "1",
           "invitation_properties":  {
                   "defaultAwsRegions":  "US_EAST_1,US_WEST_2",
                   "enableZeroCloudCloudProvider":  "false",
                   "skipSubscriptionCheck":  "true",
                   "enableAWSCloudProvider":  "true",
                   "accountLinkingOptional":  "false",
                   "enabledAvailabilityZones":  "{\"us-east-1\":[\"iad6\",\"iad7\",\"iad12\"],\"us-west-2\":[\"pdx1\",\"pdx2\",\"pdx4\"]}",
                   "sddcLimit":  "1",
                   "sla":  "CUSTOMER",
                   "orgType": "CUSTOMER_POC",
                   "defaultHostsPerSddc":  "4",
                   "hostLimit":  "6",
                   "defaultIADDatacenter":  "iad6",
                   "defaultPDXDatacenter":  "pdx4"
                 },
           "funds_required":  "false"
         },
   url:     "https://vmc.vmware.com/vmc/api/operator/invitations/service-invitations"
  }, function(error, response, body){
   console.log("Invite - " + body);
   return callback(body);
   });
  });
  }

}; /* the end */

