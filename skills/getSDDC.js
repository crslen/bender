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
  controller.hears(['(find|show|get|list) sddcs for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    var orgId = message.match[2];
    valFunc.getSDDC(orgId, function(sddc) {
      if (sddc.length == 0) {
        bot.reply(message, {
          text: "I couldn't find any SDDC's deployed for " + orgId + "."
        });
      } else {
        var sddcStr = JSON.stringify(sddc);
        var jsonStr = JSON.parse(sddcStr);
        console.log("results:" + jsonStr.length);
        for (var i = 0; i < jsonStr.length; i++) {
          bot.reply(message, {
            text: "Here's what I found for " + orgId,
            attachments: [{
              //"title": "SDDC Info",
              "color": colorArray[i],
              //"title": "Mode Analytics Report",
              //"title_link": "https://modeanalytics.com/vmware_inc/reports/1c69ccf26a01",
              "fields": [{
                  "title": "SDDC Name",
                  "value": jsonStr[i].name,
                  "short": true
                },
               /* {
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
                  "title": "AWS Region",
                  "value": jsonStr[i].region,
                  "short": true
                },
                {
                  "title": "Powered on VMs",
                  "value": jsonStr[i].powered_on_vms,
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
                },*/
                {
                  "title": "SDDC ID",
                  "value": jsonStr[i].sddc_id,
                  "short": true
                }
              ],
            }]
          });
        }
      }
    });
  });

  controller.hears(['get (.*) sddc'], 'direct_message,direct_mention,mention', (bot, message) => {

    var customer = message.match[1];
    bot.reply(message, "Checking to see if I have an Org ID for " + customer);
    //check to see if org and refresh token are in tech validation table
    valFunc.getToken(customer, function(res) {
      var jsonParse = JSON.stringify(res);
      console.log("parse:" + jsonParse);
      var jsonStr = JSON.parse(jsonParse);
      var orgId = jsonStr[0].org_id;
      var rToken = jsonStr[0].refresh_token;
      console.log("orgid: " + orgId);
      console.log("refreshtoken: " + rToken);
      if (orgId != "") {
        valFunc.getSDDC(orgId, function(sddc) {
          if (sddc.length == 0) {
            bot.reply(message, {
              text: "I couldn't find any SDDC's deployed for " + customer + "."
            });
          } else {
            var sddcStr = JSON.stringify(sddc);
            var jsonStr = JSON.parse(sddcStr);
            console.log("results:" + jsonStr.length);
            for (var i = 0; i < jsonStr.length; i++) {
              bot.reply(message, {
                text: "Here's what I found for " + customer,
                attachments: [{
                  "title": "SDDC Info",
                  "color": colorArray[i],
                  //"title": "Mode Analytics Report",
                  //"title_link": "https://modeanalytics.com/vmware_inc/reports/1c69ccf26a01",
                  "fields": [{
                      "title": "SDDC Name",
                      "value": jsonStr[i].name,
                      "short": true
                    },
                    {
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
                      "title": "AWS Region",
                      "value": jsonStr[i].region,
                      "short": true
                    },
                    {
                      "title": "Powered on VMs",
                      "value": jsonStr[i].powered_on_vms,
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
                    }
                  ],
                }]
              });
            }
          }
        });
      } else {
        bot.reply(message, "I cannot find Org ID in the Tech Validation database for " + customer + ". Use `@bender update " + customer + "` to update Org ID.")
      }
    });

    //bot.startConversation(message, askAuthToken);
  });

}; /* the end */
