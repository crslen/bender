/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

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

module.exports = function(controller) {

  controller.hears(['get workshop status'], 'direct_message,direct_mention,mention', (bot, message) => {

    //var customer = message.match[1];
    bot.reply(message, "Checking status....");
    valFunc.getWkshpSDDC(function(sddc) {
      if (sddc.length == 2) {
        bot.reply(message, {
          text: "I couldn't find any workshop SDDC's deployed."
        });
      } else {
        var sddcStr = JSON.stringify(sddc);
        var jsonStr = JSON.parse(sddcStr);
        bot.reply(message, "A total of *" + jsonStr.length + "* SDDC's have been deployed.");
        console.log("results:" + jsonStr.length);
        for (var i = 0; i < jsonStr.length; i++) {
          //if (jsonStr[i].Actual_Start_Date == null) {var startDate = "None"} else {var startDate = jsonStr[i].Actual_Start_Date.value}
          //if (jsonStr[i].End_Date == null) {var endDate = "None"} else {var endDate = jsonStr[i].End_Date.value}
          bot.reply(message, {
            //text: "Here's what I found",
            attachments: [{
              "title": jsonStr[i].name,
              "color": colorArray[i],
              //"title": "Mode Analytics Report",
              //"title_link": "https://modeanalytics.com/vmware_inc/reports/1c69ccf26a01",
              "fields": [{
                  "title": "Status",
                  "value": jsonStr[i].sddc_state,
                  "short": true
                },
                {
                  "title": "Created",
                  "value": jsonStr[i].created,
                  "short": true
                },
                {
                  "title": "Age in Days",
                  "value": jsonStr[i].age_days,
                  "short": true
                },
                {
                  "title": "Powered on VMs",
                  "value": jsonStr[i].powered_on_vms,
                  "short": true
                }
                /*{
                  "title": "AWS Region",
                  "value": jsonStr[i].region,
                  "short": true
                },

                {
                  "title": "VMC Version",
                  "value": jsonStr[i].vmc_version,
                  "short": true
                },
                {
                  "title": "VMC Internal Version",
                  "value": jsonStr[i].vmc_internal_version,
                  "short": true
                },
                {
                  "title": "Org ID",
                  "value": jsonStr[i].org_id,
                  "short": true
                },
                {
                  "title": "SDDC ID",
                  "value": jsonStr[i].sddc_id,
                  "short": true
                }*/
              ],
            }]
          });
        }
      }
    });
  });

}; /* the end */
