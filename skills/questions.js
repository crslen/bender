var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
let valFunc = require("../model/valFunctions");
let benderQuestions = require("../json/BenderQuestions.json");

module.exports = function(controller) {

  controller.hears(['add technical blocker'], 'direct_message, direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      var jsonProperties = "";
      //var strQuestion = "";
      //var strVariable = "";
      //grab questions related to survey
      var jsonWKS = benderQuestions[1];
      var jsonStr = JSON.stringify(jsonWKS);
      var obj = JSON.parse(jsonStr);
      console.log("json: " + jsonStr);
      console.log("length: " + obj.Questions.length);

      //strQuestion = obj.Questions[i].Question;
      //strVariable = obj.Questions[i].variable;

      convo.addMessage(obj.description);
      //Question #1
      convo.addQuestion(obj.Questions[0].Question, function(response, convo) {
        jsonProperties = jsonProperties + '"' + obj.Questions[0].variable + '": "' + response.text + '",';
        convo.gotoThread('Q2');
      }, {}, 'default');
      console.log("json prop: " + jsonProperties);

      //Question #2
      if (obj.Questions[1].field_type == "dropdown") {
        console.log("dropdown: " + obj.Questions[1].field_type);
          convo.addQuestion({
            attachments: [{
              title: obj.Questions[1].Question,
              callback_id: 'Q2',
              attachment_type: 'default',
              color: '#629aca',
              actions: [{
                "name": "use_case",
                "text": "Pick something...",
                "type": "select",
                "options": obj.Questions[1].fields
              }]
            }]
          }, [{
            default: true,
            callback: function(response, convo) {
              jsonProperties = jsonProperties + '"' + obj.Questions[1].variable + '": "' + response.text + '",';
              convo.gotoThread('Q3');
            }
          }], {}, 'Q2');
      } else {
        convo.addQuestion(obj.Questions[1].Question, function(response, convo) {
          jsonProperties = jsonProperties + '"' + obj.Questions[1].variable + '": "' + response.text + '",';

          convo.gotoThread('Q3');
        }, {}, 'Q2');
      }
      console.log("json prop: " + jsonProperties);

      //Question #3
      convo.addQuestion(obj.Questions[2].Question, function(response, convo) {
        jsonProperties = jsonProperties + '"' + obj.Questions[2].variable + '": "' + response.text + '",';

        convo.gotoThread('Q4');
      }, {}, 'Q3');
      console.log("json prop: " + jsonProperties);

      //Question #4
      convo.addQuestion(obj.Questions[3].Question, function(response, convo) {
        jsonProperties = jsonProperties + '"' + obj.Questions[3].variable + '": "' + response.text + '",';

        confTask(response, convo);
        convo.gotoThread('end');
      }, {}, 'Q4');
      console.log("json prop: " + jsonProperties);

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
      convo.addQuestion(obj.Questions[0].Question, function(response, convo) {
        jsonProperties = jsonProperties + '"' + obj.Questions[0].variable + '": "' + response.text + '",';
        convo.gotoThread('Q2');
      }, {}, 'default');
      console.log("json prop: " + jsonProperties);

      //Question #2
      convo.addQuestion(obj.Questions[1].Question, function(response, convo) {
        jsonProperties = jsonProperties + '"' + obj.Questions[1].variable + '": "' + response.text + '",';

        convo.gotoThread('Q3');
      }, {}, 'Q2');
      console.log("json prop: " + jsonProperties);

      //Question #3
      convo.addQuestion(obj.Questions[2].Question, function(response, convo) {
        jsonProperties = jsonProperties + '"' + obj.Questions[2].variable + '": "' + response.text + '",';

        convo.gotoThread('Q4');
      }, {}, 'Q3');
      console.log("json prop: " + jsonProperties);

      //Question #4
      convo.addQuestion(obj.Questions[3].Question, function(response, convo) {
        jsonProperties = jsonProperties + '"' + obj.Questions[3].variable + '": "' + response.text + '",';

        confTask(response, convo);
        convo.gotoThread('end');
      }, {}, 'Q4');
      console.log("json prop: " + jsonProperties);

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

};
