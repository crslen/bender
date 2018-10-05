var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
var valFunc = require('../model/valFunctions');
var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];

module.exports = function(controller) {

  controller.on('interactive_message_callback', function(bot, message) {
    var action_id = message.actions[0].value;
    var ids = message.callback_id.split('|');
    var customer = ids[1];
    var sfOpp = ids[2];
    if (action_id == 'select-cap' || action_id == 'Yes-cap') {
      bot.createConversation(message, function(err, convo) {
        var jsonProperties = "";
        jsonProperties = jsonProperties + '"customer_name": "' + customer + '",';
        jsonProperties = jsonProperties + '"opportunity_id": "' + sfOpp + '",';

        //convo.addMessage("");
        //Question #1

        convo.addQuestion("What is the expected deployment date? (MM/DD/YYYY)", function(response, convo) {
          jsonProperties = jsonProperties + '"expected_deployment_date": "' + response.text + '",';

          convo.gotoThread('Q2');
        }, {}, 'default');

        convo.addQuestion({
          attachments: [{
            title: "Select desired AWS region",
            callback_id: 'capQ2',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "capRegion",
              "text": "Pick region...",
              "type": "select",
              "option_groups": fields.awsRegionsCap()
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"region": "' + response.text + '",';
            convo.gotoThread('Q3');
          }
        }], {}, 'Q2');


        //Question #3
        convo.addQuestion({
          attachments: [{
            title: "Select the desired hardware instance type",
            callback_id: 'capQ3',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "instanceType",
              "text": "Pick hardware...",
              "type": "select",
              "options": fields.instanceType()
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"instance_type": "' + response.text + '",';
            convo.gotoThread('Q4');
          }
        }], {}, 'Q3');


        //Question #4

        convo.addQuestion("How many hosts will be deployed", function(response, convo) {
          jsonProperties = jsonProperties + '"hosts_deployed": "' + response.text + '",';
          //confTask(response, convo);
          convo.gotoThread('Q5');
        }, {}, 'Q4');

        //Question #5
        convo.addQuestion("Please add any notes related to this plan", function(response, convo) {
          jsonProperties = jsonProperties + '"notes": "' + response.text + '",';
          confTask(response, convo);
          convo.gotoThread('end');
        }, {}, 'Q5');

        convo.addMessage('Okay thank you very much for the valuable info, human.', 'end');
        convo.activate();

        let confTask = (response, convo) => {
          bot.api.users.info({
            user: message.user
          }, (error, response) => {
            let {
              name,
              real_name
            } = response.user;
            jsonProperties = jsonProperties + `"submitted_by": "${real_name}"`;
            //jsonProperties = jsonProperties.substring(0, jsonProperties.length - 1);
            console.log("jsonProperties: " + JSON.stringify(jsonProperties));
            var jsonInput = `{
            "event": "Deployment Plan",
            "userId": "bender@vmware.com",
            "properties": {${jsonProperties}}
          }`;
            jsonInput = JSON.parse(jsonInput);
            console.log("jsonInput: " + JSON.stringify(jsonInput));
            valFunc.insertSegment(jsonInput, function(res) {
              console.log("segment response: " + res);
            });
          });
        };
      });
    } else {
      if (action_id == 'No-cap') {
        bot.reply(message, "Ok going back to my hole. Byeeee!");
      }
    }

  });

  controller.hears(['(new|add) deployment plan for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    var activity; //customer name
    var category = "";
    var customer = "";
    customer = message.match[2];

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
            title: 'You still want to enter a new capacity plan?',
            callback_id: 'actions-cap|' + customer + "|null",
            attachment_type: 'default',
            actions: [{
                "name": "yes",
                "text": "Yes",
                "value": "Yes-cap",
                "type": "button",
              },
              {
                "name": "no",
                "text": "No",
                "value": "No-cap",
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
              "color": colorArray[i],
              callback_id: 'actions-cap|' + jsonStr[i].account_name + "|" + jsonStr[i].opportunity_id,
              actions: [{
                "name": "select",
                "text": "Select",
                "value": "select-cap",
                "type": "button",
              }],
            }]
          });
        }
      }
    });
  });
  /*  controller.hears(['get activities for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
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
    });*/
}; /*the end*/
