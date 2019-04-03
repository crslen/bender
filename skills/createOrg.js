var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
let valFunc = require("../model/valFunctions");
var color = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];

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
              if (res[0].result == null) {
                bot.reply(message, "I don't see " + customer + " in the tech validation database or this has been selected as a <b>paid pilot</b>. If it's not a paid pilot make sure " + customer + " is added by asking me `@bender add POC for " + customer + "`")
                convo.stop();
              } else {
                var results = res[0].result.split('|');
                if (results[0] == "Yes" && results[1].toLowerCase().indexOf("poc") >= 0) {
                  bot.reply(message, "Glad to see " + customer + " is in the tech validation database.");
                  valFunc.getPreFlight(customer, function(res) {
                    console.log("response: " + res[0].response);
                    if (res[0].response == "No") {
                      bot.reply(message, {
                        text: "I couldn't find any pre-flight info on " + customer + ".  Make sure the customer and account team fills out this survey - https://www.surveymonkey.com/r/vmc-tech-val-preflight"
                      });
                    } else {
                      bot.reply(message, {
                        text: fields.yayMessage() + "  I see that " + customer + " filled out the pre-flight survey.  You're one step closer to onboarding!"
                      });
                    }
                    //define partner or customer poc
                    if (results[1].toLowerCase().indexOf("partner") >= 0) {
                      var tvType = "PARTNER_POC";
                    } else {
                      var tvType = "CUSTOMER_POC";
                    }
                    askPartner(tvType, response, convo);
                    convo.next();
                  });
                }
              }
            });
          });
        };

        let askPartner = (tvType, response, convo) => {
          if (tvType == "PARTNER_POC") {
            console.log("tvtype:" + tvType)
            convo.ask({
              attachments: [{
                title: 'Will this POC be for a partner or customer?',
                callback_id: 'poctvType',
                attachment_type: 'default',
                color: color,
                actions: [{
                    "name": "Customer",
                    "text": "Customer",
                    "value": "Customer",
                    "type": "button",
                  },
                  {
                    "name": "Partner",
                    "text": "Partner",
                    "value": "Partner",
                    "type": "button",
                  }
                ]
              }]
            }, [{
                pattern: "Customer",
                callback: function(reply, convo) {
                  tvType = "CUSTOMER_POC";
                  confTask(tvType, response, convo);
                  convo.next();
                }
              },
              {
                pattern: "Partner",
                callback: function(reply, convo) {
                  tvType = "PARTNER_POC";
                  confTask(tvType, response, convo);
                  convo.next();
                }
              },
              {
                default: true,
                callback: function(response, convo) {
                  // = response.text;
                  confTask(tvType, response, convo);
                  convo.next();
                }
              }
            ]);
        } else {
          confTask(tvType, response, convo);
          convo.next();
        }
        }

        let askNetwork = (tvType, response, convo) => {

          convo.ask({
            attachments: [{
              title: 'Will NSX-T need to be enabled?',
              callback_id: 'networkType',
              attachment_type: 'default',
              color: color,
              actions: [{
                  "name": "yes",
                  "text": "Yes",
                  "value": "Yes",
                  "type": "button",
                },
                {
                  "name": "no",
                  "text": "No",
                  "value": "No",
                  "type": "button",
                }
              ]
            }]
          }, [{
              pattern: "yes",
              callback: function(reply, convo) {
                let ntwkType = "NSXT";
                var ntMessage = '' +
                  'Before you provision a new SDDC submit a `VMC Request` ticket in Jira - https://servicedesk.eng.vmware.com/servicedesk/customer/portal/3/create/166 with the following details in the description field:\n' +
                  'Please enable NSX-T for customer ' + customer + '\n' +
                  '*White list the following flags:*\n' +
                  'sddcLicensesInConfigService\n' +
                  'vsanEncryption\n' +
                  'i3pToI3MetalMigration\n' +
                  'enableNsxtDeployment\n' +
                  'enableDraasAddOnForNsxt\n' +
                  '*Black list the following flags:*\n' +
                  'accountLinkingDelay\n' +
                  '\n' +
                  '*Org ID:* <long unique ID>\n' +
                  '*Planned Deployment Region:* <Region Name>\n' +
                  '*Current SDDCs in Org:* <None>\n' +
                  'To expedite the request post the ticket URL and customer name to slack channel #m5-p1-rollout-support'
                convo.say(ntMessage);
                confTask(ntwkType, tvType, response, convo);
                convo.next();
                // do something awesome here.
              }
            },
            {
              pattern: "no",
              callback: function(reply, convo) {
                convo.say('Ok good to know');
                let ntwkType = "NSXV";
                confTask(ntwkType, tvType, response, convo);
                convo.next();
              }
            },
            {
              default: true,
              callback: function(response, convo) {
                // = response.text;
                confTask(tvType, response, convo);
                convo.next();
              }
            }
          ]);
        };

        let confTask = (tvType, response, convo) => {
          console.log("tvType to invite: " + tvType)
          valFunc.getInvite(tvType, function(vmcInvite) {
            //vmcInvite = JSON.parse(vmcInvite);
            bot.reply(message, {
              text: "Here's the invite for " + customer + " - " + vmcInvite.invitation_url
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
                  "network_type": "NSXT",
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
//for MOU Partner orgs
  controller.hears(['create mou org'], 'direct_message,direct_mention,mention', (bot, message) => {
    valFunc.validateUser(bot, message, function(cb) {
      if (cb == 1) {
  
        let confTask = (response, convo) => {
          var tvType = "PARTNER_MOU"
          valFunc.getInvite(tvType, function(vmcInvite) {
            //vmcInvite = JSON.parse(vmcInvite);
            bot.reply(message, {
              text: "Here's the MOU Partner invite - " + vmcInvite.invitation_url
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
                  "customer_name": "Partner",
                  "invite_url": vmcInvite,
                  "org_type": tvType,
                  "network_type": "NSXT",
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
        bot.startConversation(message, confTask);
      } else {
        bot.reply(message, "Sorry you do not have access to perform this operation.");
      }
    });
  });

}; /* the end */
