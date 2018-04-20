/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');

module.exports = function(controller) {


  //add user
  controller.hears(['add (.*) to (.*)'], 'direct_message,direct_mention', (bot, message) => {

    let confTask = (response, convo) => {
      //convo.setVar('createorg', getInvite(function(rToken){}));
      var orgName = message.match[2];
      var wsUser = message.match[1];
      convo.say("Adding " + message.match[1] + " to org " + message.match[2]);
      addUser(orgName, wsUser, function(results) {

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
      removeUser(wsName, wsUser, function(results) {

        bot.reply(message, {
          text: "Results: " + results
        });
      });
    };
    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, confTask);

  });

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* Utility function to add user */
  function addUser(orgName, wsUser, callback) {
    var jsonWKS = require("/data/bender/dev/json/workshop.json");
    var regex = /\:(.*?)\|/;
    wsUser = regex.exec(wsUser)[1];
    //console.log(jsonWKS);
    jsonStr = JSON.stringify(jsonWKS);
    obj = JSON.parse(jsonStr);
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].OrgName.toUpperCase() == orgName.toUpperCase()) {
        oToken = obj[i].RefreshToken;
        orgId = obj[i].OrgId;
        console.log("Found token: " + oToken + " and org: " + orgId);
      }
    }
    //get auth token
    var request = require('request');
    request.post({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      form: {
        "refresh_token": oToken
      },
      url: "https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize"
    }, function(error, response, body) {
      var jsonStr = JSON.parse(body);
      var rToken = jsonStr.access_token;
      //return callback(rToken);
      //get sddc status
      var request = require('request');
      request.post({
        headers: {
          'csp-auth-token': rToken,
          'Content-Type': 'application/json'
        },
        json: {
          'usernames': [wsUser],
          'orgRoleName': 'org_member',
          'serviceRolesDtos': [{
            'serviceDefinitionLink': '/csp/gateway/slc/api/definitions/external/ybUdoTC05kYFC9ZG560kpsn0I8M_',
            'serviceRoleNames': ['vmc-user:full']
          }]
        },
        url: "https://console.cloud.vmware.com/csp/gateway/am/api/orgs/" + orgId + "/invitations"
      }, function(error, response, body) {
        var results = JSON.stringify(body);
        //var jsonRes = JSON.parse(results);
        console.log("add results - " + results);
        return callback(results);
      });
    });
  }

  function removeUser(wsName, wsUser, callback) {
    var jsonWKS = require("/data/bender/dev/json/workshop.json");
    var regex = /\:(.*?)\|/;
    wsUser = regex.exec(wsUser)[1];
    console.log("hi " + wsUser + " on " + wsName);
    jsonStr = JSON.stringify(jsonWKS);
    //console.log(jsonStr);
    obj = JSON.parse(jsonStr);
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].OrgName.toUpperCase() == wsName.toUpperCase()) {
        console.log("Found: " + obj[i].RefreshToken);
        oToken = obj[i].RefreshToken;
        orgId = obj[i].OrgId;
        //} else {
        //	console.log("no org found");
        //	return "no org found";
      }
    }
    //get auth token
    var request = require('request');
    request.patch({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      form: {
        "refresh_token": oToken
      },
      url: "https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize"
    }, function(error, response, body) {
      var jsonStr = JSON.parse(body);
      var rToken = jsonStr.access_token;
      //return callback(rToken);
      //remove users
      var request = require('request');
      request.post({
        headers: {
          'csp-auth-token': rToken,
          'Content-Type': 'application/json'
        },
        json: {
          'email': wsUser
        },
        url: "https://console.cloud.vmware.com/csp/gateway/am/api/orgs/" + orgId + "/users"
      }, function(error, response, body) {
        var results = JSON.stringify(body);
        console.log("remove results - " + results);
        return callback(results);
      });
    });
  }
}; /* the end */
