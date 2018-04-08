/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
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

    controller.on('heard_trigger', function() {
        stats.triggers++;
    });

    controller.on('conversationStarted', function() {
        stats.convos++;
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
        }
        else {
          var jsonParse = JSON.stringify(res);
          var jsonStr = JSON.parse(jsonParse);

          for (var i = 0; i < jsonStr.length; i++) {
            if (jsonStr[i].Actual_Start_Date == null) {var startDate = "None"} else {var startDate = jsonStr[i].Actual_Start_Date.value}
            if (jsonStr[i].End_Date == null) {var endDate = "None"} else {var endDate = jsonStr[i].End_Date.value}

          	bot.reply(message, {
              	text: "Here's what I found for " + jsonStr[i].Customer_Name,
                attachments: [
                                {
                                    "title": "Validation Tracker Info",
                                    "color": colorArray[i],
                                    //"title": "Mode Analytics Report",
                                    //"title_link": "https://modeanalytics.com/vmware_inc/reports/1c69ccf26a01",
                                    "fields": [
                                              {
                                                  "title": "Customer",
                                                  "value": jsonStr[i].Customer_Name,
                                                  "short": true
                                              },
                                              {
                                                  "title": "Status",
                                                  "value": jsonStr[i].Status + " - " + jsonStr[i].Type,
                                                  "short": true
                                              }
                                              /*{
                                                "title": "SET Member",
                                                "value": jsonStr[i].SE_Specialist,
                                                "short": true
                                              },
                                              {
                                                "title": "Use Cases",
                                                "value": jsonStr[i].Primary_Use_Case + "\n" + jsonStr[i].Secondary_Use_Case + "\n" + jsonStr[i].Tertiary_Use_Case,
                                                "short": true
                                              },
                                              {
                                                "title": "Start Date",
                                                "value": startDate,
                                                "short": true
                                              },
                                              {
                                                "title": "End Date",
                                                "value": endDate,
                                                "short": true
                                              },
                                              {
                                                "title": "Deployed AWS Region",
                                                "value": jsonStr[i].Primary_AWS_Region,
                                                "short": true
                                              },
                                              {
                                                "title": "Desired AWS Region",
                                                "value": jsonStr[i].Secondary_AWS_Region,
                                                "short": true
                                              },
                                              {
                                                "title": "Compliance Requirements",
                                                "value": jsonStr[i].Compliance,
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
                                                "title": "SF Opportunity ID",
                                                "value": jsonStr[i].SFDC_OPPTY_ID, //https://vmware.my.salesforce.com/_ui/search/ui/UnifiedSearchResults?searchType=2&str=
                                                "short": true
                                              },
                                              {
                                                "title": "Cloud Specialist",
                                                "value": jsonStr[i].Cloud_Specialist,
                                                "short": true
                                              },
                                              {
                                                "title": "Notes",
                                                "value": jsonStr[i].Notes + "\r\n" + jsonStr[i].Next_Step,
                                                "short": false
                                              }*/
                                          ],
                                }
                              ]
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
        }
        else {
          var jsonParse = JSON.stringify(res);
					console.log("return: " + jsonParse);
          var jsonStr = JSON.parse(jsonParse);

          for (var i = 0; i < jsonStr.length; i++) {
          //  if (jsonStr[i].Actual_Start_Date == null) {var startDate = "None"} else {var startDate = jsonStr[i].Actual_Start_Date.value}
            //if (jsonStr[i].End_Date == null) {var endDate = ""} else {var endDate = jsonStr[i].End_Date.value}
						if(jsonStr[i].compliance !== null) {var compliance = jsonStr[i].compliance.replace("|","\n")} else {var compliance = "None"};
						if(jsonStr[i].use_case !== null) {var use_case = jsonStr[i].use_case.replace("|","\n")} else {var use_case = "None"};
						if(jsonStr[i].region !== null) {var region = jsonStr[i].region.replace("|","\n")} else {var region = "None"};
						if(jsonStr[i].services !== null) {var service = jsonStr[i].services.replace("|","\n")} else {var service = "None"};
          	bot.reply(message, {
              	text: "Here's what I found for " + jsonStr[i].Customer_Name,
                attachments: [
                                {
                                    "title": "Validation Tracker Info",
                                    "color": colorArray[i],
                                    "title": "Mode Analytics Report",
                                    "title_link": "https://modeanalytics.com/vmware_inc/reports/1c69ccf26a01",
                                    "fields": [
                                              {
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
                                                "value": jsonStr[i].Actual_Start_Date,
                                                "short": true
                                              },
                                              {
                                                "title": "End Date",
                                                "value": jsonStr[i].End_Date,
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
                                                "title": "SF Opportunity ID",
                                                "value": jsonStr[i].SFDC_OPPTY_ID, //https://vmware.my.salesforce.com/_ui/search/ui/UnifiedSearchResults?searchType=2&str=
                                                "short": true
                                              },
                                              {
                                                "title": "Cloud Specialist",
                                                "value": jsonStr[i].Cloud_Specialist,
                                                "short": true
                                              },
																							{
																								"title": "Pre-flight Complete?",
																								"value": jsonStr[i].pre_flight,
																								"short": true
																							},
                                              {
                                                "title": "Notes",
                                                "value": jsonStr[i].Notes,
                                                "short": false
                                              }
                                          ],
                                }
                              ]
          	        });
                 }
              }
         });
         //convo.say("Here's the invite: {{vars.createorg}}")
      //});
    });
    //function to get customer tracker information
    function selectCustomer(customer, searchType, callback) {

			let sqlQuery;
			if (searchType == 1) {
        // Search by customer name
				sqlQuery = `SELECT *
                      FROM dbo.tech_validation_tracker_view
                      WHERE lower(Customer_name) like '%${customer}%'`;
                  }
      else {
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

