/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');

module.exports = function(controller) {

    /* Collect some very simple runtime stats for use in the uptime/debug command */
    var stats = {
        triggers: 0,
        convos: 0,
    }

    controller.on('heard_trigger', function() {
        stats.triggers++;
    });

    controller.on('conversationStarted', function() {
        stats.convos++;
    });

    controller.hears(['get(.*)orgs', 'list(.*)orgs'], 'direct_message,direct_mention,mention', (bot, message) => {

    let customer;

    let askAuthToken = (response, convo) => {

        convo.ask("Going to need your OAuth Refresh Token buddy", (response, convo) => {
            oauthToken = response.text;
            confTask(response, convo);
            convo.next();
        });
    };

    let askTechVal = (response, convo) => {

        convo.ask("Has the account team complete the tech-validation survey?", (response, convo) => {
            techVal = response.text;
	    if (techVal.toLowerCase() === "yes" || techVal.toLowerCase() === "ya" || techVal.toLowerCase() === "yeah") {
		askPreFlight(response, convo);
	        //convo.next();
	    } else {
		bot.reply(message, {
			text:  "You're either not making sense to me or you need to make sure the tech-validation and pre-flight survey get completed."
		});
	    }
	    convo.next();
        });
    };

    let askPreFlight = (response, convo) => {

        convo.ask("Has the customer complete the pre-flight checklist survey?", (response, convo) => {
            preFlight = response.text;
            if (preFlight.toLowerCase() === "yes" || preFlight.toLowerCase() === "ya" || preFlight.toLowerCase() === "yeah") {
                confTask(response, convo);
                //convo.next();
            } else {
                bot.reply(message, {
                        text:  "You're either not making sense to me or you need to make sure the tech-validation and pre-flight survey get completed."
                });
            }
            convo.next();
        });
    };

    let confTask = (response, convo) => {
       //convo.setVar('createorg', getInvite(function(rToken){}));
       convo.say("Looking up your orgs");
       getInvite(oauthToken, function(orgs) {

    	bot.reply(message, {
        	text: "Here's the list of org names and ids that you are assigned to:\n " + orgs
    	});
       });
       //convo.say("Here's the invite: {{vars.createorg}}")
    };


    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, askAuthToken);

});

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Utility function to format uptime */
  function getInvite(oToken, callback) {
   var request = require('request');
   //get auth token
   request.post({
    headers: {"Content-Type" : "application/x-www-form-urlencoded", "Accept": "application/json"},
    form: {"refresh_token": oToken},
    url:     "https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize"
   }, function(error, response, body){
   var jsonStr = JSON.parse(body);
   var rToken = jsonStr.access_token;
   //return callback(rToken);
   //get sddc status
   var request = require('request');
   var orgID = "2a8ac0ba-c93d-4748-879f-7dc9918beaa5"
   request.get({
     headers: {'csp-auth-token': rToken, 'Content-Type': 'application/json'},
     //url:     "https://vmc.vmware.com/vmc/api/orgs/" + orgID + "/sddcs"
     url:     "https://vmc.vmware.com/vmc/api/orgs"
   }, function(error, response, body){
     //var invite = JSON.parse(body);
     //console.log("org results - " + body);
     var jsonStr = JSON.parse(body);
     var nameStr
     for (var i = 0; i < jsonStr.length; i++){
	nameStr = nameStr + " " + jsonStr[i].display_name + " - " + jsonStr[i].id + "\n";     
     }
     console.log("orgs - " + nameStr);
     return callback(nameStr);
     });
   });
  }

}; /* the end */

