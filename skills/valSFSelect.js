var wordfilter = require('wordfilter');
var valFunc = require('../model/valFunctions')
var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];

//enable wit ai
var wit = require('botkit-witai')({
  accessToken: process.env.witai_token,
  minConfidence: 0.6,
  logLevel: "debug"
});

module.exports = function(controller) {

  //controller.middleware.receive.use(wit.receive);

  //controller.hears(['salesforce'], 'direct_message,direct_mention,mention', wit.hears, function(bot, message) {
  controller.hears(['get (.*) sf opp', 'get (.*) salesforce opp'], 'direct_message,direct_mention,mention', function(bot, message) {
    valFunc.validateUser(message, function(cb) {
      if (cb == 1) {
        var sfCustomer = message.match[1];
        bot.reply(message, "Please hold.....");
        valFunc.getSFDC(sfCustomer, function(res) {
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
                      "value": jsonStr[i].name,
                      "short": true
                    },
                    {
                      "title": "SF Opportunity ID",
                      "value": jsonStr[i].id + "\n" + jsonStr[i].opportunity_id__c,
                      "short": true
                    },
                    {
                      "title": "Opportunity Type",
                      "value": jsonStr[i].recordtype,
                      "short": true
                    },
                    {
                      "title": "Account Name",
                      "value": jsonStr[i].accountname,
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
                      "value": jsonStr[i].stagename,
                      "short": true
                    },
                    {
                      "title": "Opportunity Owner",
                      "value": jsonStr[i].opportunity_owner_name__c,
                      "short": true
                    },
                    {
                      "title": "Amount",
                      "value": jsonStr[i].amount,
                      "short": true
                    },
                    {
                      "title": "Sales Territory",
                      "value": jsonStr[i].primary_field_sales_territory__c,
                      "short": true
                    },
                    {
                      "title": "Next Steps",
                      "value": jsonStr[i].next_steps__c,
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
  });

}; /* the end */
