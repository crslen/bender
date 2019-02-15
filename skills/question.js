var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
let valFunc = require("../model/valFunctions");
let benderQuestions = require("../json/BenderQuestions.json");

module.exports = function(controller) {
  controller.hears(['test'], 'direct_message, direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      var jsonProperties = "";
      //var strQuestion = "";
      //var strVariable = "";
      //grab questions related to survey
      var jsonWKS = benderQuestions[0];
      var jsonStr = JSON.stringify(jsonWKS);
      var obj = JSON.parse(jsonStr);
      var i = 0;
      var goto = "";
      var pos = "";

      convo.addMessage(obj.description);

      while (i < obj.Questions.length) {
        //Question #
        console.log(i + " " + obj.Questions.length);
        if (i == 0) {
          pos = 'default';
        } else {
          pos = `Q${i}`;
        }
        if (i == obj.Questions.length - 1) {
          goto = 'end'
        } else {
          goto = `Q${i + 1}`;
        }

        console.log(goto);
        /*  if (obj.Questions[i].field_type == "dropdown") {

            convo.addQuestion({
              attachments: [{
                title: obj.Questions[i].Question,
                callback_id: `Q${i}`,
                attachment_type: 'default',
                color: '#629aca',
                actions: [{
                  "name": `Q${i}`,
                  "text": "Pick something...",
                  "type": "select",
                  "options": obj.Questions[i].fields
                }]
              }]
            }, [{
              default: true,
              callback: function(response, convo) {
                jsonProperties = jsonProperties + '"' + obj.Questions[i].variable + '": "' + response.text + '",';
                convo.gotoThread(goto);
              }
            }], {}, pos);
          } else { */
        convo.addQuestion(obj.Questions[i].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[0].variable + '": "' + response.text + '",';

          convo.gotoThread(goto);
        }, {}, pos);
        //}
        i++
      }

      convo.addMessage('Okay thank you very much for the valuable info, human.', 'end');
      convo.activate();

      /*let confTask = (response, convo) => {
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
          "event": "${obj.event}",
          "userId": "bender@vmware.com",
          "properties": {${jsonProperties}}
        }`;
          jsonInput = JSON.parse(jsonInput);
          console.log("jsonInput: " + JSON.stringify(jsonInput));
          valFunc.insertSegment(jsonInput, function(res) {
            console.log("segment response: " + res);
          });
        });
      };*/
    });
  });

  controller.hears(['add technical blocker'], 'direct_message, direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      var jsonProperties = "";
      //var strQuestion = "";
      //var strVariable = "";
      //grab questions related to survey
      var jsonWKS = benderQuestions[1];
      var jsonStr = JSON.stringify(jsonWKS);
      var obj = JSON.parse(jsonStr);

      convo.addMessage(obj.description);
      //Question #1
      if (obj.Questions[0].field_type == "dropdown") {

        convo.addQuestion({
          attachments: [{
            title: obj.Questions[0].Question,
            callback_id: 'Q0',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "Q0",
              "text": "Pick something...",
              "type": "select",
              "options": obj.Questions[0].fields
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"' + obj.Questions[0].variable + '": "' + response.text + '",';
            convo.gotoThread('Q1');
          }
        }], {}, 'default');
      } else {
        convo.addQuestion(obj.Questions[0].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[0].variable + '": "' + response.text + '",';

          convo.gotoThread('Q1');
        }, {}, 'default');
      }

      //Question #2
      if (obj.Questions[1].field_type == "dropdown") {

        convo.addQuestion({
          attachments: [{
            title: obj.Questions[1].Question,
            callback_id: 'Q1',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "Q1",
              "text": "Pick something...",
              "type": "select",
              "options": obj.Questions[1].fields
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"' + obj.Questions[1].variable + '": "' + response.text + '",';
            convo.gotoThread('Q2');
          }
        }], {}, 'Q1');
      } else {
        convo.addQuestion(obj.Questions[1].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[1].variable + '": "' + response.text + '",';

          convo.gotoThread('Q2');
        }, {}, 'Q1');
      }

      //Question #3
      if (obj.Questions[2].field_type == "dropdown") {

        convo.addQuestion({
          attachments: [{
            title: obj.Questions[2].Question,
            callback_id: 'Q2',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "Q2",
              "text": "Pick something...",
              "type": "select",
              "options": obj.Questions[2].fields
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"' + obj.Questions[2].variable + '": "' + response.text + '",';
            convo.gotoThread('Q3');
          }
        }], {}, 'Q2');
      } else {
        convo.addQuestion(obj.Questions[2].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[2].variable + '": "' + response.text + '",';

          convo.gotoThread('Q3');
        }, {}, 'Q2');
      }

      //Question #4
      if (obj.Questions[3].field_type == "dropdown") {

        convo.addQuestion({
          attachments: [{
            title: obj.Questions[3].Question,
            callback_id: 'Q3',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "Q3",
              "text": "Pick something...",
              "type": "select",
              "options": obj.Questions[3].fields
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"' + obj.Questions[3].variable + '": "' + response.text + '",';
            convo.gotoThread('end');
          }
        }], {}, 'Q3');
      } else {
        convo.addQuestion(obj.Questions[3].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[3].variable + '": "' + response.text + '",';
          confTask(response, convo);
          convo.gotoThread('end');
        }, {}, 'Q3');
      }

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
          "event": "${obj.event}",
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
  });

  controller.hears(['Provide Storage Information'], 'direct_message, direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      convo.task.timeLimit = 60000
      var jsonProperties = "";
      //var strQuestion = "";
      //var strVariable = "";
      //grab questions related to survey
      var jsonWKS = benderQuestions[0];
      var jsonStr = JSON.stringify(jsonWKS);
      var obj = JSON.parse(jsonStr);
      console.log("json: " + jsonStr);
      console.log("length: " + obj.Questions.length);

      //strQuestion = obj.Questions[i].Question;
      //strVariable = obj.Questions[i].variable;

      convo.addMessage(obj.description);
      //Question #1
      if (obj.Questions[0].field_type == "dropdown") {

        convo.addQuestion({
          attachments: [{
            title: obj.Questions[0].Question,
            callback_id: 'Q0',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "Q0",
              "text": "Pick something...",
              "type": "select",
              "options": obj.Questions[0].fields
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"' + obj.Questions[0].variable + '": "' + response.text + '",';
            convo.gotoThread('Q1');
          }
        }], {}, 'default');
      } else {
        convo.addQuestion(obj.Questions[0].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[0].variable + '": "' + response.text + '",';

          convo.gotoThread('Q1');
        }, {}, 'default');
      }

      //Question #2
      if (obj.Questions[1].field_type == "dropdown") {

        convo.addQuestion({
          attachments: [{
            title: obj.Questions[1].Question,
            callback_id: 'Q1',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "Q1",
              "text": "Pick something...",
              "type": "select",
              "options": obj.Questions[1].fields
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"' + obj.Questions[1].variable + '": "' + response.text + '",';
            convo.gotoThread('Q2');
          }
        }], {}, 'Q1');
      } else {
        convo.addQuestion(obj.Questions[1].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[1].variable + '": "' + response.text + '",';

          convo.gotoThread('Q2');
        }, {}, 'Q1');
      }

      //Question #3
      if (obj.Questions[2].field_type == "dropdown") {

        convo.addQuestion({
          attachments: [{
            title: obj.Questions[2].Question,
            callback_id: 'Q2',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "Q2",
              "text": "Pick something...",
              "type": "select",
              "options": obj.Questions[2].fields
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"' + obj.Questions[2].variable + '": "' + response.text + '",';
            convo.gotoThread('Q3');
          }
        }], {}, 'Q2');
      } else {
        convo.addQuestion(obj.Questions[2].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[2].variable + '": "' + response.text + '",';

          convo.gotoThread('Q3');
        }, {}, 'Q2');
      }

      //Question #4
      if (obj.Questions[3].field_type == "dropdown") {

        convo.addQuestion({
          attachments: [{
            title: obj.Questions[3].Question,
            callback_id: 'Q3',
            attachment_type: 'default',
            color: '#629aca',
            actions: [{
              "name": "Q3",
              "text": "Pick something...",
              "type": "select",
              "options": obj.Questions[3].fields
            }]
          }]
        }, [{
          default: true,
          callback: function(response, convo) {
            jsonProperties = jsonProperties + '"' + obj.Questions[3].variable + '": "' + response.text + '",';
            convo.gotoThread('end');
          }
        }], {}, 'Q3');
      } else {
        convo.addQuestion(obj.Questions[3].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[3].variable + '": "' + response.text + '",';
          confTask(response, convo);
          convo.gotoThread('end');
        }, {}, 'Q3');
      }
      console.log("json prop: " + jsonProperties);

      convo.addMessage('Okay thank you very much for the valuable info, human.', 'end');
      convo.activate();
      convo.task.timeLimit = 5000;
      convo.on('end', function(convo) {
        if (convo.status == 'timeout') {
          console.log("timeout");
          convo.say("session ended");
        }
      });

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
          "event": "${obj.event}",
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
  });

};
