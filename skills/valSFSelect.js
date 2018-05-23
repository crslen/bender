var wordfilter = require('wordfilter');
var valFunc = require('../model/valFunctions')
var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

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
    console.log(message);
    //var entityStr = JSON.stringify(message.entities);
    //var entityJson = JSON.parse(entityStr);

    //console.log(entityJson.customer[0].value);
    //var sfCustomer = entityJson.customer[0].value;
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
                }
              ],
            }]
          });
        }
      }
    });

  });

}; /* the end */
