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


    controller.hears(['create org', 'new org'], 'direct_message,direct_mention,mention', (bot, message) => {

    let customer;

    let askCustomer = (response, convo) => {

        convo.ask("What's the customer name?", (response, convo) => {
            customer = response.text;
            askTechVal(response, convo);
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
       convo.say("Ok, just making sure you're doing your work properly :smile:.  Time to work my magic and create an invitation for " + customer);
       getInvite(function(rToken) {
 	//console.log("response" + rToken);
	//convo.say("Here's the invite: {{rToken}}");
    	bot.reply(message, {
        	text: "Here's the invite for " + customer + " - " + rToken
    	});
       });
       //convo.say("Here's the invite: {{vars.createorg}}")
    };


    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, askCustomer);

});


    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Utility function to format uptime */
  function getInvite(callback) {
   var request = require('request');
   //get auth token
   request.post({
    headers: {"Content-Type" : "application/x-www-form-urlencoded", "Accept": "application/json"},
    form: {"refresh_token": "6163a32c-b7e5-4fad-b675-e7492b7141eb"},
    url:     "https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize"
   }, function(error, response, body){
   var jsonStr = JSON.parse(body);
   var rToken = jsonStr.access_token;
   //return callback(rToken);
   //request org invitation url
   var request = require('request');
   //console.log(rToken);
   request.post({
     headers: {'csp-auth-token': rToken, 'Content-Type': 'application/json'},
     json: {"preset_name":  "CUSTOMER",
             "number_of_invitations": "1",
             "invitation_properties":  {
                     "defaultAwsRegions":  "US_EAST_1,US_WEST_2",
                     "enableZeroCloudCloudProvider":  "false",
                     "skipSubscriptionCheck":  "true",
                     "enableAWSCloudProvider":  "true",
                     "accountLinkingOptional":  "false",
                     "enabledAvailabilityZones":  "{\"us-east-1\":[\"iad6\",\"iad7\",\"iad12\"],\"us-west-2\":[\"pdx1\",\"pdx2\",\"pdx4\"]}",
                     "sddcLimit":  "1",
                     "sla":  "CUSTOMER",
		     "orgType": "CUSTOMER_POC",
                     "defaultHostsPerSddc":  "4",
                     "hostLimit":  "6",
                     "defaultIADDatacenter":  "iad6",
                     "defaultPDXDatacenter":  "pdx4"
             },
             "funds_required":  "false"
     },
     url:     "https://vmc.vmware.com/vmc/api/operator/invitations/service-invitations"
   }, function(error, response, body){
     //var invite = JSON.parse(body);
     console.log("Invite - " + body);
     return callback(body);
     });
   });
  }

}; /* the end */

/* updated script for new api
 //request org invitation url
 var request = require('request');
 request.post({
   headers: {'x-api-key': "ZskwjVSREl2rIp961VTyzavlzhZg5LrG8Dk78mlj", 'Content-Type': 'application/json'},
   json: {"org_type":"CUSTOMER_POC",
          "regions":["us-east-1", "us-west-2"],
          "num_of_hosts":4,
          "invitation_properties":{
              "hostLimit":6,
              "skipSubscriptionCheck": "true"
          },
          "skip_fund_check": "true"
      },
   url:     "https://cwf1lbhfc4.execute-api.us-west-2.amazonaws.com/dev/generate-invitations"
 }, function(error, response, body){
   var invite = JSON.stringify(body);
   invite = JSON.parse(invite);
   console.log("Invite - " + invite.invitation_url);
   });

*/
