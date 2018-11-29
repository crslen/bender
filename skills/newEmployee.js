var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
let valFunc = require("../model/valFunctions");

module.exports = function(controller) {

  controller.hears(['(add|new) team member (.*)'], 'direct_message, direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      var groupIds = ["SBBEKT4JH", "SBKH9TAGJ"]; //default groups
      var slackHandle = message.match[2];
      var email = message.match[2] + "@vmware.com";

      convo.addMessage("I can help you with that!");
      //Question #1
      convo.addQuestion({
        attachments: [{
          title: "Which team would you like to add `" + slackHandle + "` to?",
          callback_id: 'default',
          attachment_type: 'default',
          color: '#629aca',
          actions: [{
            "name": "default",
            "text": "Pick team...",
            "type": "select",
            "options": fields.vmcsetTeams()
          }]
        }]
      }, [{
        default: true,
        callback: function(response, convo) {
          groupIds.push(response.text); //ww team
          confTask(response, convo);
          convo.gotoThread('end');
        }
      }], {}, 'default');


      convo.addMessage('Okay working on adding ' + slackHandle + ' to the appropriate groups.', 'end');
      convo.activate();

      let confTask = (response, convo) => {

        //var regex = /\:(.*?)\|/;
        //email = regex.exec(email)[1];
        var i = 0;
        console.log(email);
        console.log("team ids: " + groupIds);
        valFunc.getUserId(bot, email, function(userId) {
          console.log("user id: " + userId);
          while (i < groupIds.length) {
            valFunc.getUserGroupList(bot, groupIds[i], function(gList, groupId) {
              console.log("user list: " + gList);
              console.log("getting group: " + groupId);
              var addUsers = gList + "," + userId;
              console.log("add users to: " + addUsers);
              valFunc.addUserGroup(bot, groupId, addUsers, function(results) {
                console.log(results);
                convo.say("Added " + slackHandle + " to group " + results);
              });
            });
            i++;
          };
        });
      };
    });
  });
}; /*the end*/
