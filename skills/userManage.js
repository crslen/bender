/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
var valFunc = require('../model/valFunctions');

module.exports = function(controller) {

  //add elw users
  controller.hears(['add elw users'], 'direct_message,direct_mention', (bot, message) => {
    valFunc.validateUser(bot, message, function(cb) {
      if (cb == 1) {

        var jsonWKS = require("../json/elw.json");
        //console.log(jsonWKS);
        jsonStr = JSON.stringify(jsonWKS);
        obj = JSON.parse(jsonStr);
        var i = 0;
        while (i < obj.length) {
          valFunc.addUser(obj[i].OrgName, obj[i].elwUser, "elw", function(results) {
            bot.reply(message, {
              text: "Results: " + results
            });
          });
          i++
        }
        bot.say({
          channel: "#vmc-se-elw",
          text: "Adding ELW users to orgs in progress."
        });
      }
    });
  });

  //remove elw users
  controller.hears(['remove elw users'], 'direct_message,direct_mention', (bot, message) => {
    valFunc.validateUser(bot, message, function(cb) {
      if (cb == 1) {

        var jsonWKS = require("../json/elw.json");
        //console.log(jsonWKS);
        jsonStr = JSON.stringify(jsonWKS);
        obj = JSON.parse(jsonStr);
        var i = 0;
        while (i < obj.length) {
          valFunc.removeUser(obj[i].OrgName, obj[i].elwUser, "elw", function(results) {
            bot.reply(message, {
              text: "Results: " + results
            });
          });
          i++
        }
        bot.say({
          channel: "#vmc-se-elw",
          text: "Removing ELW users in progress from orgs."
        });
      }
    });
  });

  //add user
  controller.hears(['add (.*) to (.*)'], 'direct_message,direct_mention', (bot, message) => {

    let confTask = (response, convo) => {
      //convo.setVar('createorg', getInvite(function(rToken){}));
      var orgName = message.match[2];
      var wsUser = message.match[1];
      convo.say("Adding " + message.match[1] + " to org " + message.match[2]);
      valFunc.addUser(orgName, wsUser, "wks", function(results) {

        bot.reply(message, {
          text: "Results: " + results
        });
      });
      //convo.say("Here's the invite: {{vars.createorg}}")
    };
    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, confTask);

  });

  //remove user
  controller.hears(['remove (.*) from (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {


    let confTask = (response, convo) => {
      var wsName = message.match[2];
      var wsUser = message.match[1];
      valFunc.removeUser(wsName, wsUser, "wks", function(results) {

        bot.reply(message, {
          text: "Results: " + results
        });
      });
    };
    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, confTask);

  });

}; /* the end */
