var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
let valFunc = require("../model/valFunctions");
let benderQuestions = require("../json/BenderQuestions.json");

module.exports = function(controller) {

  controller.hears(['(http.*)'], 'direct_message, direct_mention, ambient', function(bot, message) {
    console.log("debug: " + JSON.stringify(message));
    bot.createConversation(message, function(err, convo) {
      var jsonProperties = "";
      var url = message.match[1];

      //convo.addMessage("I can help you with that!");
      //Question #1
      convo.addQuestion({
        attachments: [{
          title: 'I see you\'re sharing some potential useful information.  Should I save it?',
          callback_id: 'usefulInfoUrl',
          attachment_type: 'default',
          color: '#629aca',
          actions: [{
              "name": "yes-ui",
              "text": "Yes",
              "value": "Yes",
              "type": "button",
            },
            {
              "name": "no-ui",
              "text": "No",
              "value": "No",
              "type": "button",
            }
          ]
        }]
      }, [{
          pattern: "yes",
          callback: function(reply, convo) {
            jsonProperties = jsonProperties + '"url": "' + url + '",';
            convo.gotoThread('Q1');
            // do something awesome here.
          }
        },
        {
          pattern: "no",
          callback: function(reply, convo) {
            convo.say("Ok going back into my hole....byeee!");
            //compType = "NA";
            convo.next();
          }
        },
        {
          default: true,
          callback: function(reply, convo) {
            //jsonProperties = jsonProperties + '"future_edge_deployments": "' + response.text + '",';
            convo.repeat();
            convo.next();
          }
        }
      ], {}, 'default');

      //Question #2
      convo.addQuestion("Please provide a description and/or keywords to help with searching.", function(response, convo) {
        jsonProperties = jsonProperties + '"keywords": "' + response.text + '",';
        confTask(response, convo);
        convo.gotoThread('end');
      }, {}, 'Q1');

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
          "event": "useful info",
          "userId": "${real_name}",
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
  });

}; /*the end*/
