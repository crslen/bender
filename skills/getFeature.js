var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
var valFunc = require('../model/valFunctions');
//var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];
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
//enable luis ai
var luis = require('botkit-middleware-luis');
var luisOptions = {
  serviceUri: process.env.serviceUri
};

module.exports = function(controller) {
  controller.middleware.receive.use(luis.middleware.receive(luisOptions));
  controller.hears(['roadmap'], 'direct_message,direct_mention,mention', function(bot, message) {
    if (message.topIntent.intent == "roadmap") {
      bot.reply(message, "Please hold.....");
      console.log(JSON.stringify(message));
      var strSearch = message.entities[0].entity;
      valFunc.getRoadmap(strSearch, function(res) {
        if (res.length == 0) {
          bot.reply(message, {
            text: "Hmm something bad happened, I can't query this information."
          });
        } else {
          var jsonParse = JSON.stringify(res);
          console.log("return: " + jsonParse);
          var jsonStr = JSON.parse(jsonParse);
          for (var i = 0; i < jsonStr.length; i++) {
            //var date = new Date(jsonStr[i].date_inserted)
            //var otDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            var rmMessage = '' +
              '*Feature Title:* ' + jsonStr[i].feature_title + '\n' +
              '*Category:* ' + jsonStr[i].feature_category + '\n' +
              '*Status:* ' + jsonStr[i].feature_status + '\n' +
              '*Owner:* ' + jsonStr[i].feature_owner + '\n' +
              '*Website Visibility:* `' + jsonStr[i].feature_website_visibility + '`\n' +
              '*Internal Milestone:* ' + jsonStr[i].feature_internal_milestone + '\n' +
              '*Description:* ' + jsonStr[i].feature_description + '\n';
            bot.reply(message, {
              attachments: [{
                color: colorArray[i],
                text: rmMessage
              }]
            });
          }
        }
      });
    }
  });
}; /*the end*/
