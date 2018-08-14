var wordfilter = require('wordfilter');
var valFunc = require('../model/valFunctions')
var execSh = require("exec-sh");
var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];

var orgName;
var orgId;
var oToken;
var sddcName;
var provider;
var cidr;
var subnetId;

module.exports = function(controller) {

  controller.hears(['delete workshop (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    var sddc = message.match[1]
    var jsonWKS = require("../json/workshop.json");
    console.log(message.match[1]);
    //console.log(jsonWKS);
    jsonStr = JSON.stringify(jsonWKS);
    obj = JSON.parse(jsonStr);
    var i = 0;
    if (sddc.toLowerCase() == 'all') {
      deleteSDDC(function callback(results) {
        console.log("stdout again: ", results);
        bot.reply(message, "Results: " + results);
      });    
      bot.reply(message, "Deleting student workshops 1 thru 10.  I'll share the results once complete, which may take up to 10 minutes.")
    }
  });

  controller.hears(['deploy workshop (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    var sddc = message.match[1]
    var jsonWKS = require("../json/workshop.json");
    console.log(message.match[1]);
    //console.log(jsonWKS);
    jsonStr = JSON.stringify(jsonWKS);
    obj = JSON.parse(jsonStr);
    var i = 0;
    if (sddc.toLowerCase() == 'all') {
      deploySDDC(function callback(results) {
        console.log("stdout again: ", results);
        bot.reply(message, "Results: " + results);
      });      
      bot.reply(message, "Deploying student workshops 1 thru 10. You can ask me `@bender get workshop status` to see if all have been deployed succesfully.")
    }
    while (i < obj.length) {
      //for (var i = 0; i < obj.length; i++) {
      if (obj[i].OrgName.toUpperCase() == sddc.toUpperCase()) {
        console.log(JSON.stringify(obj[i]));
        provider = obj[i].Provider;
        console.log("Found token: " + obj[i].RefreshToken + " and org: " + obj[i].OrgId + " and name: " + obj[i].SDDCName);
        valFunc.deploySDDC(obj[i].OrgId, obj[i].SDDCName, obj[i].SubnetId, obj[i].CIDR, "AWS", obj[i].RefreshToken, function(res) {
          var jsonParse = JSON.stringify(res);
          var jsonStr = JSON.parse(jsonParse);
          console.log("response: " + jsonStr.status);
          if (jsonStr.status == "STARTED") {
            bot.reply(message, "Deployment of *" + jsonStr.params.sddcConfig.name + "* has *" + jsonStr.status + "*.  Please wait 45 seconds before deploying another SDDC.");
          } else {
            bot.reply(message, "Error message *" + jsonStr.status + "*.  Waiting 45 seconds to deploy the next.");
          }
        });
      }
      i++;
    }

  });

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
function deploySDDC(callback) {
  execSh(["/data/bender/vmc/create_sddc.sh"], true,
    function(err, stdout, stderr) {
      console.log("error: ", err);
      console.log("stdout: ", stdout);
      console.log("stderr: ", stderr);
      return callback(stdout);
    });
}

function deleteSDDC(callback) {
  execSh(["/data/bender/vmc/delete_sddc.sh"], true,
    function(err, stdout, stderr) {
      console.log("error: ", err);
      console.log("stdout: ", stdout);
      console.log("stderr: ", stderr);
      return callback(stdout);
    });
}
  /*  function wait(timeout) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("done");
          resolve()
        }, timeout)
      })
    }*/
  /*function sleep(milliseconds) {
    setTimeout(function() {
    console.log("timeout");
  },60000);
    /*var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds) {
        break;
      }
    }
  }*/
}; /* the end */
