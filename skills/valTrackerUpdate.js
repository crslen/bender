/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
let fields = require("../json/valFields");
let color = "#009cdb";

module.exports = function(controller) {

    controller.hears(['update (.*)'], 'direct_message, direct_mention,mention', function(bot, message) {

      let customer = message.match[1];

      let askField = (response, convo) => {

        convo.ask({
          attachments:[
                      {
                          title: 'Which field do you want to update?',
                          callback_id: 'uField',
                          attachment_type: 'default',
                          color: color,
                          actions: [
                              {
                                  "name":"uField",
                                  "text": "Pick a field...",
                                  "type": "select",
                                  "options": fields.uFields()
                              }
                          ]
                      }
                  ]
              },[
                {
                  default: true,
                callback: function(response, convo) {
                  updateField = response.text;
                  console.log(response.text);
                  getUpdate(response, convo);
                  convo.next();
                }
              }
              ]);
          };

      let getUpdate = (response,convo) => {
        switch(updateField) {
          case "SFDC_OPPTY_ID":
            convo.ask("What's the SalesForce Opportunity ID?", (response, convo) => {
                updateValue = response.text;
                confTask(response, convo);
                convo.next();
            });
            break;
          case "Customer_Name":
            convo.ask("What's the customer's new name?", (response, convo) => {
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
          case "Actual_Start_Date":
            convo.ask("Start Date? (yyyy-mm-dd)", (response, convo) => {
                updateValue = response.text;
                confTask(response, convo);
                convo.next();
            });
            break;
          case "End_date":
            convo.ask("End Date? (yyyy-mm-dd)", (response, convo) => {
              updateValue = response.text;
              confTask(response, convo);
              convo.next();
          });
            break;
          case "Cloud_Specialist":
              convo.ask("Who is the Cloud Specialist assigned to " + customer + "?", (response, convo) => {
                updateValue = response.text;
                confTask(response, convo);
                convo.next();
            });
            break;
          case "CS_Architect":
              convo.ask("Who is the Customer Success assigned to " + customer + "?", (response, convo) => {
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
          case "Notes":
            convo.ask("Append additional notes", (response, convo) => {
              updateValue = response.text;
              confTask(response, convo);
              convo.next();
            });
            break;
          case "Status":
            convo.ask({
              attachments:[
                          {
                              title: 'What is the current status?',
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
                      updateValue = response.text;
                      confTask(response, convo);
                      convo.next();
                    }
                  }
                  ]);
            break;
          case "Type":
            convo.ask({
              attachments:[
                          {
                              title: 'Is this a POC or Paid Pilot?',
                              callback_id: 'type',
                              attachment_type: 'default',
                              color: color,
                              actions: [
                                  {
                                      "name":"type",
                                      "text": "Type...",
                                      "type": "select",
                                      "options": [
                                        {
                                          "text": "POC",
                                          "value": "POC"
                                        },
                                        {
                                          "text": "Paid Pilot",
                                          "value": "Paid Pilot"
                                        }]
                                  }
                              ]
                          }
                      ]
                  },[
                    {
                      default: true,
                    callback: function(response, convo) {
                      updateValue = response.text;
                      confTask(response, convo);
                      convo.next();
                    }
                  }
                ]);
            break;
          case "Compliance":
              convo.ask({
                attachments:[
                            {
                                title: 'What is the primary compliance requirement?',
                                callback_id: 'compType',
                                attachment_type: 'default',
                                color: color,
                                actions: [
                                    {
                                        "name":"CompType",
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
                        updateValue = response.text;
                        confTask(response, convo);
                        convo.next();
                      }
                    }
                    ]);
              break;
            case "Primary_Use_Case":
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
                        updateValue = response.text;
                        confTask(response, convo);
                        convo.next();
                      }
                    }
                    ]);
              break;
            case "Secondary_Use_Case":
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
                        updateValue = response.text;
                        confTask(response, convo);
                        convo.next();
                      }
                    }
                    ]);
            break;
            case "Tertiary_Use_Case":
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
                        updateValue = response.text;
                        confTask(response, convo);
                        convo.next();
                      }
                    }
                    ]);
            break;
            case "Primary_AWS_Region":
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
                        updateValue = response.text;
                        confTask(response, convo);
                        convo.next();
                      }
                    }
                    ]);
            break;
            case "Secondary_AWS_Region":
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
                        updateValue = response.text;
                        confTask(response, convo);
                        convo.next();
                      }
                    }
                    ]);
            break;
        }
        //update the fields in bigquery
        console.log("done with case");

    };

    let confTask = (response, convo) => {
      //update info
      updateCustomer(customer, updateField, updateValue, function(res) {
        console.log("response: " + res);
        if (res == 0) {
          bot.reply(message, {
            text: "I couldn't find any info on " + customer + " or the the update failed."
          });
        }
        else {
          bot.reply(message, {
            text: "Your info has been updated!"
          });
        }
        //let us know if more fields need to be updated if marked complete won.
        if(updateValue == 'Complete Won') {
          bot.reply(message, {
            text: "Don't forget to update Cloud Specialist, Customer Success member and projected number of hosts."
          });
          bot.say({
              channel: "#tech-validation",
              text: customer + " has been updated as a win!"
          });
        }
      });//end of function

    };

      bot.startConversation(message, askField);
    });

    //function to get customer tracker information
    function updateCustomer(customer, updateField, updateValue, callback) {
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
      customer = customer.toLowerCase();
      customer = customer.replace("*","%");
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

      var upDate = mm + '/' + dd + '/' + yyyy;

      // Update val tracker
      if (updateField == 'Notes') {
        sqlQuery = `UPDATE dbo.pocs_and_pilots
          SET notes = CONCAT(notes, CHAR(13),CAST(CONVERT(date, getdate()) as nvarchar),'-', '${updateValue}')
              ,date_updated = '${upDate}'
          WHERE lower(customer_name) like '${customer}'`;
        }
      else {
        sqlQuery = `UPDATE dbo.pocs_and_pilots
          SET ${updateField} = '${updateValue}'
              ,date_updated = '${upDate}'
          WHERE lower(customer_name) like '${customer}'`;
      }
      sql.connect(config, err => {
			    console.log("connect error: " + err);

			    // Query

			    new sql.Request().query(sqlQuery, (err, result) => {
			        // ... error checks
							sql.close();
			        console.log(result.rowsAffected);
							return callback(result.rowsAffected);
			    })

			})

			sql.on('error', err => {
			    console.log("on error:" + err);
			})
    }
}; /* the end */
