var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
var valFunc = require('../model/valFunctions');
var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];

module.exports = function(controller) {

  controller.hears(['find roadmap on (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, "Please hold.....");
    var strSearch = message.match[1];
    valFunc.getRoadmap(strSearch, function(res) {
      if (res.length == 0) {
        bot.reply(message, {
          text: "Hmm something bad happend, I can't query this information."
        });
      } else {
        var jsonParse = JSON.stringify(res);
        console.log("return: " + jsonParse);
        var jsonStr = JSON.parse(jsonParse);

        for (var i = 0; i < jsonStr.length; i++) {
          var date = new Date(jsonStr[i].date_inserted)
          var otDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          var rmMessage = '' +
            '*Feature Title:* ' + jsonStr[i].feature_title + '\n' +
            '*Category:* ' + jsonStr[i].feature_category + 
            '*Status:* ' + jsonStr[i].feature_status + '\n' +
            '*Owner:* ' + jsonStr[i].feature_owner + '\n' +
            '*Description:* ' + jsonStr[i].feature_description + '\n';
          bot.reply(message, {
            text: rmMessage
          });
        }
      }
    });
  });
}; /*the end*/
