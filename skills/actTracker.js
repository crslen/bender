var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
var valFunc = require('../model/valFunctions');
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

  controller.on('interactive_message_callback', function(bot, message) {
    var ids = message.callback_id.split('|');
    var action_id = message.actions[0].value;
    var customer = ids[1];
    var sfdc_id = ids[2];
    console.log("callback: " + message.callback_id);
    console.log("action: " + action_id);

    if (action_id == 'select' || action_id == 'Yes') {
      let askActivity = (response, convo) => {

        convo.ask({
          attachments: [{
            title: "Select an activity?",
            callback_id: 'activity',
            attachment_type: 'default',
            color: "#999966",
            actions: [{
              "name": "activity",
              "text": "Pick an activity...",
              "type": "select",
              "options": fields.actCategory()
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            actCat = response.text;
            askNotes(response, convo);
            convo.next();
          }
        }]);
      };

      let askNotes = (response, convo) => {

        convo.ask("Please provide the details of " + actCat + " for " + customer, (response, convo) => {
          notes = response.text;
          confTask(response, convo);
          convo.next();
        });
      };

      let confTask = (response, convo) => {

        bot.api.users.info({
          user: message.user
        }, (error, response) => {
          let {
            name,
            real_name
          } = response.user;

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

          var rows = "('" + customer + "','" +
            sfdc_id + "','" +
            actCat + "','" +
            real_name + "','" +
            notes + "','" +
            estDate + "')";

          valFunc.insertActivity(rows, function(res) {
            if (res == 0) {
              bot.reply(message, {
                text: "Your info was not added for whatever reason."
              });
            } else {
              bot.reply(message, {
                text: "Your info has been added!"
              });
            }
          });

          var jsonInput = {
            "event": "SET Activities",
            "userId": "clennon@vmware.com",
            "properties": {
              "customer_name": customer,
              "sf_id": sfdc_id,
              "Activity": actCat,
              "se_specialist": real_name,
              "date_inserted": estDate,
              "notes": notes
            }
          }
          valFunc.insertSegment(jsonInput, function(res) {
            console.log("segment response: " + res);
          });

        })
      };
      bot.startConversation(message, askActivity);
    } else {
      bot.reply(message, "Ok going back to my hole.");
    }

  });

  controller.hears(['new activity for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    var activity; //customer name
    var category = "";
    var customer = "";
    customer = message.match[1];

    bot.reply(message, {
      text: "Searching opportunities for " + customer + "....."
    });

    valFunc.getSFDC(customer, function(res) {
      if (res.length == 0) {
        bot.reply(message, {
          text: "I couldn't find any opportunities on " + customer + " :shocked:"
        });
        bot.reply(message, {
          attachments: [{
            title: 'You still want to enter an activity?',
            callback_id: 'actions|' + customer + "|null",
            attachment_type: 'default',
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
        });
      } else {
        var jsonParse = JSON.stringify(res);
        console.log("return: " + jsonParse);
        var jsonStr = JSON.parse(jsonParse);

        for (var i = 0; i < jsonStr.length; i++) {

          bot.reply(message, {
            //text: "Here's what I found for " + customer,
            attachments: [{
              "color": colorArray[i],
              "fields": [{
                  "title": "Account Name",
                  "value": jsonStr[i].accountname,
                  "short": true
                },
                {
                  "title": "SF Opportunity ID",
                  "value": jsonStr[i].id + "\n" + jsonStr[i].opportunity_id__c,
                  "short": true
                },
                {
                  "title": "Opportunity Type",
                  "value": jsonStr[i].recordtype,
                  "short": true
                },

                {
                  "title": "Stage",
                  "value": jsonStr[i].stagename,
                  "short": true
                },
                {
                  "title": "Opportunity Owner",
                  "value": jsonStr[i].opportunity_owner_name__c,
                  "short": true
                }
              ],
              callback_id: 'actions|' + jsonStr[i].accountname + "|" + jsonStr[i].id,
              actions: [{
                "name": "select",
                "text": "Select",
                "value": "select",
                "type": "button",
              }],
            }]
          });
        }
      }
    });
  });



}; /*the end*/
