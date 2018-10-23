var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
var valFunc = require('../model/valFunctions');
var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];

module.exports = function(controller) {

  controller.on('interactive_message_callback', function(bot, message) {
    var action_id = message.actions[0].value;

    if (action_id == 'select-act' || action_id == 'Yes-act') {
      var ids = message.callback_id.split('|');
      var customer = ids[1];
      var sfdc_id = ids[2];
      console.log("callback: " + message.callback_id);
      console.log("action: " + action_id);
      console.log("name:" + JSON.stringify(message));
      let askActivity = (response, convo) => {
        bot.reply(message, "Type `cancel` or `exit` to back out of this conversation.")
        /*convo.setTimeout(60000 * 1);
        convo.onTimeout(function(convo) {
          convo.say('Adiós')
        })*/
        convo.ask({
          attachments: [{
            title: "Select an activity?",
            callback_id: 'activity',
            attachment_type: 'default',
            color: colorArray,
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

            var catList = fields.actCategory();
            console.log(catList);
            console.log(catList.indexOf(response.text));
            //if (catList.indexOf(actCat) >= 0) {
            askNotes(response, convo);
            convo.next();
            //} else {
            //  bot.reply(message,"You didn't select anything in the dropdown.  Try again.");
            //  askActivity(response, convo);
            //  convo.next();
            //}
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
        if ((response.text.toLowerCase() === 'cancel') || (response.text.toLowerCase() === 'exit')) {
          convo.say('Okay. Byeeee!');
          convo.stop();
        } else {
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

            var jsonInput = {
              "event": "SET Activities",
              "userId": "bender@vmware.com",
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
            bot.reply(message, {
              text: "Your info has been added and will be available to view within the *next hour*."
            });
          })
        }
      };
      bot.startConversation(message, askActivity);
    } else {
      if (action_id == 'No-act') {
        bot.reply(message, "Ok going back to my hole. Byeeee!");
      }
    }

  });

  controller.hears(['new activity for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    var activity; //customer name
    var category = "";
    var customer = "";
    customer = message.match[1];
    bot.createConversation(message, function(err, convo) {
      convo.addMessage({
        text: "Searching opportunities for " + customer + "....."
      }, {}, "default")

      valFunc.getSFDC(customer, null, function(res) {
        if (res.length == 0) {
          convo.addMessage({
            text: "I couldn't find any opportunities for " + customer + " :shocked:"
          });
          convo.addMessage({
            attachments: [{
              title: 'You still want to enter an activity?',
              callback_id: 'actions-act|' + customer + "|null",
              attachment_type: 'default',
              actions: [{
                  "name": "yes",
                  "text": "Yes",
                  "value": "Yes-act",
                  "type": "button",
                },
                {
                  "name": "no",
                  "text": "No",
                  "value": "No-act",
                  "type": "button",
                }
              ]
            }]
          });
        } else {
          var jsonParse = JSON.stringify(res);
          console.log("return: " + jsonParse);
          var jsonStr = JSON.parse(jsonParse);

          convo.addMessage({
            text: "If possible select a Cloud Opportunity"
          });

          for (var i = 0; i < jsonStr.length; i++) {

            var sfMessage = '' +
              '*Account Name:* ' + jsonStr[i].account_name + '\n' +
              '*Opportunity ID:* ' + jsonStr[i].opportunity_id + ' or ' + jsonStr[i].opportunity_name + '\n' +
              '*Opportunity Type:* ' + jsonStr[i].record_type + '\n' +
              '*Stage:* ' + jsonStr[i].opportunity_stage + '\n' +
              '*Date Created:* ' + jsonStr[i].opportunity_create_date + '\n' +
              '*Opportunity Owner:* ' + jsonStr[i].opportunity_owner_name + '\n';

            convo.addMessage({
              //text: "Here's what I found for " + customer,
              attachments: [{
                "text": sfMessage,
                "color": colorArray[i],
                callback_id: 'actions-act|' + jsonStr[i].account_name + "|" + jsonStr[i].opportunity_id,
                actions: [{
                  "name": "select",
                  "text": "Select",
                  "value": "select-act",
                  "type": "button",
                }],
              }]
            });
          }
          convo.addMessage({
            attachments: [{
              title: 'Click Continue if you would like to bypass the above SF selection.',
              callback_id: 'actions-act|' + customer + "|null",
              attachment_type: 'default',
              actions: [{
                  "name": "continue",
                  "text": "Continue",
                  "value": "Yes-act",
                  "type": "button",
                },
                {
                  "name": "exit",
                  "text": "Exit",
                  "value": "No-act",
                  "type": "button",
                }
              ]
            }]
          });
        }
        convo.activate();
      });
      convo.activate();
    });
  });
  controller.hears(['get activities for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, "Please hold.....");
    var customer = message.match[1];
    valFunc.getActivities(customer, function(res) {
      if (res.length == 0) {
        bot.reply(message, {
          text: "Hmm something bad happend, I can't query this information."
        });
      } else {
        var jsonParse = JSON.stringify(res);
        console.log("return: " + jsonParse);
        var jsonStr = JSON.parse(jsonParse);

        for (var i = 0; i < jsonStr.length; i++) {
          var date = new Date(jsonStr[i].timestamp)
          var otDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          bot.reply(message, {
            text: "`" + otDate + "` - *" + jsonStr[i].activity + "* " + jsonStr[i].notes + "\n *" + jsonStr[i].se_specialist + "*"
          });
        }
      }
    });
  });
}; /*the end*/
