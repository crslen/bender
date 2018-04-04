/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
const projectId = "spry-water-668";
const datasetId = "vmc_set_tech_validations";
const tableId = "pocs_and_pilots";

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
      if(updateValue == 'Complete Won') {
        bot.reply(message, {
          text: "Don't forget to update Cloud Specialist, Customer Success member and projected number of hosts."
        });
        bot.say({
            channel: "#tech-validation",
            text: customer + " has been updated as a win!"
        });
      }
      updateCustomer(datasetId, tableId, customer, updateField, updateValue, projectId, function(res) {
        if (res.length != 0) {
          bot.reply(message, {
            text: "I couldn't find any info on " + customer + " or the update failed."
          });
        }
        else {
          bot.reply(message, {
            text: "Your info has been updated!"
          });
        }
      });//end of function

    };

      bot.startConversation(message, askField);
    });


    //function to get customer tracker information
    function updateCustomer(datasetId, tableId, customer, updateField, updateValue, projectId, callback) {
      // Imports the Google Cloud client library
      customer = customer.toLowerCase();
      customer = customer.replace("*","%");

      const BigQuery = require('@google-cloud/bigquery');
      let sqlQuery;

      // Creates a client
      const bigquery = new BigQuery({
        projectId: projectId,
      });
      // Update val tracker
      if (updateField == 'Notes') {
        sqlQuery = `UPDATE vmc_set_tech_validations.pocs_and_pilots
          SET notes = CONCAT(notes, '\\r\\n',CAST(CURRENT_DATE() as string),'-', '${updateValue}')
          WHERE lower(customer_name) like '${customer}'`;
        }
      else {
        sqlQuery = `UPDATE vmc_set_tech_validations.pocs_and_pilots
          SET ${updateField} = '${updateValue}'
          WHERE lower(customer_name) like '${customer}'`;
      }

      console.log(sqlQuery);
      // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
      const options = {
        query: sqlQuery,
        useLegacySql: false, // Use standard SQL syntax for queries.
      };

      // Runs the query
      bigquery
        .dataset(datasetId)
        .query(options)
        .then(results => {
          const rows = results[0];
          console.log(rows);
          return callback(rows);
        })
        .catch(err => {
          console.error('ERROR:', err);
          return callback('ERROR:', err);
        });
    }
}; /* the end */

