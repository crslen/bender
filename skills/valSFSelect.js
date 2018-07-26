var wordfilter = require('wordfilter');
var valFunc = require('../model/valFunctions')
var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];

//enable luis ai
var luis = require('botkit-middleware-luis');
var luisOptions = {
  serviceUri: process.env.serviceUri
};

module.exports = function(controller) {

  controller.middleware.receive.use(luis.middleware.receive(luisOptions));
  controller.hears(['salesforce','sf opp'], 'direct_message,direct_mention,mention', function(bot, message) {
    //controller.hears(['get (.*) sf opp', 'get (.*) salesforce opp'], 'direct_message,direct_mention,mention',  function(bot, message) {
    console.log(JSON.stringify(message));
    if (message.topIntent.intent == "salesforce") {
      valFunc.validateUser(bot, message, function(cb) {
        if (cb == 1) {
          var sfCustomer = message.entities[0].entity;
          bot.reply(message, "Please hold.....");
          valFunc.getSFDC(sfCustomer, 'All', function(res) {
            if (res.length == 0) {
              bot.reply(message, {
                text: "I couldn't find any SF info on " + sfCustomer + "."
              });
            } else {
              var jsonParse = JSON.stringify(res);
              console.log("return: " + jsonParse);
              var jsonStr = JSON.parse(jsonParse);

              for (var i = 0; i < jsonStr.length; i++) {

                bot.reply(message, {
                  text: "Here's what I found for " + sfCustomer,
                  attachments: [{
                    "title": "SFDC Opportunity Info",
                    "color": colorArray[i],
                    "title": "VMware SalesForce",
                    "title_link": "https://vmware.my.salesforce.com/" + sfCustomer,
                    "fields": [{
                        "title": "Opportunity Name",
                        "value": jsonStr[i].opportunity_name,
                        "short": true
                      },
                      {
                        "title": "SF Opportunity ID",
                        "value": jsonStr[i].opportunity_id + "\n" + jsonStr[i].opportunity_number,
                        "short": true
                      },
                      {
                        "title": "Opportunity Type",
                        "value": jsonStr[i].record_type,
                        "short": true
                      },
                      {
                        "title": "Account Name",
                        "value": jsonStr[i].account_name,
                        "short": true
                      },
                      /*  {
                          "title": "Geo",
                          "value": jsonStr[i].Geo,
                          "short": true
                        },
                        {
                          "title": "Industry",
                          "value": jsonStr[i].Industry,
                          "short": true
                        },
                        {
                          "title": "Country",
                          "value": jsonStr[i].Country,
                          "short": true
                        },
                        {
                          "title": "Vertical",
                          "value": jsonStr[i].Sales_Classification,
                          "short": true
                        },*/
                      {
                        "title": "Stage",
                        "value": jsonStr[i].opportunity_stage,
                        "short": true
                      },
                      {
                        "title": "Opportunity Owner",
                        "value": jsonStr[i].opportunity_owner_name,
                        "short": true
                      },
                      {
                        "title": "Amount",
                        "value": jsonStr[i].opportunity_amount,
                        "short": true
                      },
                      {
                        "title": "CSM",
                        "value": jsonStr[i].csm_name,
                        "short": true
                      },
                      {
                        "title": "Use Cases",
                        "value": jsonStr[i].use_case,
                        "short": true
                      },
                      {
                        "title": "Opportunity Details",
                        "value": "*Geo*: " + jsonStr[i].geo + "\n" + "*Region*: " + jsonStr[i].region + "\n" + "*Industry*: " + jsonStr[i].industry + "\n" + "*Classification*: " + jsonStr[i].sales_classification,
                        "short": true
                      },
                      {
                        "title": "Next Steps",
                        "value": jsonStr[i].next_steps_desc,
                        "short": false
                      }
                    ],
                  }]
                });
              }
            }
          });
        } else {
          bot.reply(message, "Sorry you do not have access to retrieve this information.");
        }
      });
    }
  });

}; /* the end */
