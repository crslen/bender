var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
let valFunc = require("../model/valFunctions");

module.exports = function(controller) {

  controller.hears(['create org', 'new org'], 'direct_message,direct_mention,mention', (bot, message) => {
    valFunc.validateUser(bot, message, function(cb) {
      if (cb == 1) {
        let customer;
        //bot.reply(message, "Sorry unable to create a new POC org.  Please check back later");

        let askCustomer = (response, convo) => {
          convo.ask("What's the customer name?", (response, convo) => {
            customer = response.text;
            valFunc.getCustomer(customer, function(res) {
              console.log(res);
              if (res == 'No') {
                bot.reply(message, "I don't see " + customer + " in the tech validation database or this has been selected as a <b>paid pilot</b>. If it's not a paid pilot make sure " + customer + " is added by asking me `@bender add POC for " + customer + "`")
                convo.stop();
              } else {
                var results = res[0].result.split('|');
                if (results[0] == "Yes" && results[1].toLowerCase().indexOf("poc") >= 0) {
                  bot.reply(message, "Glad to see " + customer + " is in the tech validation database.");
                  valFunc.getPreFlight(customer, function(res) {
                    console.log("response: " + res[0].response);
                    if (res[0].response == 'No') {
                      bot.reply(message, {
                        text: "I couldn't find any pre-flight info on " + customer + ".  Make sure the customer and account team fills out this survey - https://www.surveymonkey.com/r/vmc-tech-val-preflight"
                      });
                    } else {
                      bot.reply(message, {
                        text: fields.yayMessage() + "  I see that " + customer + " filled out the pre-flight survey.  You're one step closer to onboarding!"
                      });
                    }
                    if (results[1].toLowerCase().indexOf("partner") >= 0) {
                      var tvType = "PARTNER_POC";
                    } else {
                      var tvType = "CUSTOMER_POC";
                    }

                    confTask(tvType, response, convo);
                    convo.next();
                  });
                }
              }
            });
          });
        };

        let confTask = (tvType, response, convo) => {
          valFunc.getInvite(tvType, function(vmcInvite) {
            vmcInvite = JSON.stringify(vmcInvite);
            bot.reply(message, {
              text: "Here's the invite for " + customer + " - " + vmcInvite
            });
            bot.reply(message, {
              text: "Once the org is created make sure to update the tech validation with the new org ID using `@bender Update " + customer + "`."
            });
            //insert into slingshot
            bot.api.users.info({
              user: message.user
            }, (error, response) => {
              let {
                name,
                real_name
              } = response.user;
              var jsonInput = {
                "event": "set org tracking",
                "userId": "bender@vmware.com",
                "properties": {
                  "customer_name": customer,
                  "invite_url": vmcInvite,
                  "org_type": tvType,
                  "se_specialist": real_name
                }
              }
              valFunc.insertSegment(jsonInput, function(res) {
                console.log("segment response: " + res);
              });
            })
          });
        };
        bot.reply(message, "OK, I can help you with that!");
        bot.startConversation(message, askCustomer);
      } else {
        bot.reply(message, "Sorry you do not have access to perform this operation.");
      }
    });
  });

}; /* the end */
