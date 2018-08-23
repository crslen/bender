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
var region
var subnetId;

module.exports = function(controller) {

  controller.hears(['delete workshop (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    valFunc.validateUser(bot, message, function(cb) {
      if (cb == 1) {
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
      } else {
        bot.reply(message, "Sorry you do not have access to perform this operation.");
      }
    });
  });

  controller.hears(['deploy workshop (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    valFunc.validateUser(bot, message, function(cb) {
      if (cb == 1) {
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
            valFunc.deploySDDC(obj[i].OrgId, obj[i].SDDCName, obj[i].SubnetId, obj[i].CIDR, "AWS", obj[i].RefreshToken, "US-WEST-2", 3, function(res) {
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
      } else {
        bot.reply(message, "Sorry you do not have access to perform this operation.");
      }
    });
  });

  controller.hears(['delete (.*) (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    valFunc.validateUser(bot, message, function(cb) {
      if (cb == 1) {
        bot.createConversation(message, function(err, convo) {
          convo.addQuestion({
            attachments: [{
              title: 'Are you sure you want to do this?',
              callback_id: 'ELWQ1',
              attachment_type: 'default',
              //color: color,
              actions: [{
                  "name": "yes",
                  "text": "Yes",
                  "value": "yes",
                  "type": "button",
                },
                {
                  "name": "no",
                  "text": "No",
                  "value": "no",
                  "type": "button",
                }
              ]
            }]
          }, [{
              pattern: "yes",
              callback: function(reply, convo) {
                convo.gotoThread('ELWQ2');
                // do something awesome here.
              }
            },
            {
              pattern: "no",
              callback: function(reply, convo) {
                convo.gotoThread('noend');
              }
            },
            {
              default: true,
              callback: function(response, convo) {
                // = response.text;
                //askStatus(response, convo);
                //convo.next();
              }
            }
          ], {}, 'default');

          convo.addQuestion({
            attachments: [{
              title: 'Are you really really sure you want to do this?',
              callback_id: 'ELWQ2',
              attachment_type: 'default',
              //color: color,
              actions: [{
                  "name": "yes",
                  "text": "Yes",
                  "value": "yes",
                  "type": "button",
                },
                {
                  "name": "no",
                  "text": "No",
                  "value": "no",
                  "type": "button",
                }
              ]
            }]
          }, [{
              pattern: "yes",
              callback: function(reply, convo) {
                confTask(convo);
                convo.gotoThread('end');
                // do something awesome here.
              }
            },
            {
              pattern: "no",
              callback: function(reply, convo) {
                convo.gotoThread('noend');
              }
            },
            {
              default: true,
              callback: function(convo) {
                // = response.text;
                //askStatus(response, convo);
                //convo.next();
              }
            }
          ], {}, 'ELWQ2');

          convo.addMessage('Here we go weeeee! :dancing-bender:', 'end');
          convo.addMessage('Ok byeeee! :dancing-bender:', 'noend');
          convo.activate();
          let confTask = (convo) => {
            var env = message.match[1]
            var sddc = message.match[2]
            console.log(message.match[1]);
            if (env == 'elw') {
              var jsonWKS = require("../json/elw.json");
            } else {
              var jsonWKS = require("../json/workshop.json");
            }
            //console.log(jsonWKS);
            jsonStr = JSON.stringify(jsonWKS);
            obj = JSON.parse(jsonStr);
            var i = 0;
            if (sddc.toLowerCase() == 'all') {
              deleteELWSDDC(function callback(results) {
                console.log("stdout again: ", results);
                bot.reply(message, "Results: " + results);
                bot.say({
                  channel: "#vmc-se-elw",
                  text: "Deleting elw workshops 1 thru 50.  The following have been started: \n" + results
                });
              });
              bot.reply(message, "Deleting elw workshops 1 thru 50.  I'll share the results once complete, which may take up to 10 minutes.")
            }
          };
        });
      } else {
        bot.reply(message, "Sorry you do not have access to perform this operation.");
      }
    });
  });

  controller.hears(['deploy (.*) (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    console.log("env: " + message.match[1]);
    console.log("sddc: " + message.match[2]);
    valFunc.validateUser(bot, message, function(cb) {
      if (cb == 1) {
        bot.createConversation(message, function(err, convo) {
          convo.addQuestion({
            attachments: [{
              title: 'Are you sure you want to do this?',
              callback_id: 'ELWQ1',
              attachment_type: 'default',
              //color: color,
              actions: [{
                  "name": "yes",
                  "text": "Yes",
                  "value": "yes",
                  "type": "button",
                },
                {
                  "name": "no",
                  "text": "No",
                  "value": "no",
                  "type": "button",
                }
              ]
            }]
          }, [{
              pattern: "yes",
              callback: function(reply, convo) {
                convo.gotoThread('ELWQ2');
                // do something awesome here.
              }
            },
            {
              pattern: "no",
              callback: function(reply, convo) {
                convo.gotoThread('noend');
              }
            },
            {
              default: true,
              callback: function(response, convo) {
                // = response.text;
                //askStatus(response, convo);
                //convo.next();
              }
            }
          ], {}, 'default');

          convo.addQuestion({
            attachments: [{
              title: 'Are you really really sure you want to do this?',
              callback_id: 'ELWQ2',
              attachment_type: 'default',
              //color: color,
              actions: [{
                  "name": "yes",
                  "text": "Yes",
                  "value": "yes",
                  "type": "button",
                },
                {
                  "name": "no",
                  "text": "No",
                  "value": "no",
                  "type": "button",
                }
              ]
            }]
          }, [{
              pattern: "yes",
              callback: function(reply, convo) {
                confTask(convo);
                convo.gotoThread('end');
                // do something awesome here.
              }
            },
            {
              pattern: "no",
              callback: function(reply, convo) {
                convo.gotoThread('noend');
              }
            },
            {
              default: true,
              callback: function(convo) {
                // = response.text;
                //askStatus(response, convo);
                //convo.next();
              }
            }
          ], {}, 'ELWQ2');

          convo.addMessage('Here we go weeeee! :dancing-bender:', 'end');
          convo.addMessage('Ok byeeee! :dancing-bender:', 'noend');
          convo.activate();

          let confTask = (convo) => {
            var env = message.match[1]
            var sddc = message.match[2]
            console.log(message.match[1]);
            if (env == 'elw') {
              var jsonWKS = require("../json/elw.json");
            } else {
              var jsonWKS = require("../json/workshop.json");
            }
            //console.log(jsonWKS);
            jsonStr = JSON.stringify(jsonWKS);
            obj = JSON.parse(jsonStr);
            var i = 0;
            if (sddc.toLowerCase() == 'all') {
              deployELWSDDC(function callback(results) {
                console.log("stdout again: ", results);
                bot.reply(message, "Results: " + results);
                //put results in #vmc-se-elw channel
                bot.say({
                  channel: "#vmc-se-elw",
                  text: "Deploying elw workshops 1 thru 50.  The following have been started: \n" + results
                });
              });
              bot.reply(message, "Deploying elw workshops 1 thru 50. You can ask me `@bender get elw status` to see if all have been deployed succesfully.")
            }
            while (i < obj.length) {
              //for (var i = 0; i < obj.length; i++) {
              if (obj[i].OrgName.toUpperCase() == sddc.toUpperCase()) {
                console.log(JSON.stringify(obj[i]));
                provider = obj[i].Provider;
                console.log("Found token: " + obj[i].RefreshToken + " and org: " + obj[i].OrgId + " and name: " + obj[i].SDDCName + " and region: " + obj[i].Region);
                valFunc.deploySDDC(obj[i].OrgId, obj[i].SDDCName, obj[i].SubnetId, obj[i].CIDR, "AWS", obj[i].RefreshToken, obj[i].Region, "1", function(res) {
                  var jsonParse = JSON.stringify(res);
                  var jsonStr = JSON.parse(jsonParse);
                  console.log("response: " + jsonStr.status);
                  if (jsonStr.status == "STARTED") {
                    bot.reply(message, "Deployment of *" + jsonStr.params.sddcConfig.name + "* has *" + jsonStr.status + "*.  Please wait 45 seconds before deploying another SDDC.");
                    bot.say({
                      channel: "#vmc-se-elw",
                      text: "Deployment of *" + jsonStr.params.sddcConfig.name + "* has *" + jsonStr.status + "*."
                    });
                  } else {
                    bot.reply(message, "Error message *" + jsonStr.status + "*.  Wait 45 seconds to deploy the next.");
                    bot.say({
                      channel: "#vmc-se-elw",
                      text: "Error message *" + jsonStr.status + "*."
                    });
                  }
                });
              }
              i++;
            }
          }
        });
      } else {
        bot.reply(message, "Sorry you do not have access to perform this operation.");
      }
    });
  });

  controller.hears(['get elw status'], 'direct_message,direct_mention,mention', (bot, message) => {

    //var customer = message.match[1];
    bot.reply(message, "Checking status....");
    //get orgid and refresh token
    var jsonWKS = require("../json/elw.json");
    jsonStr = JSON.stringify(jsonWKS);
    obj = JSON.parse(jsonStr);
    var i = 0;
    var r = 0;
    while (i < obj.length) {
      var rToken = obj[i].RefreshToken;
      var orgId = obj[i].OrgId;
      //  if (obj[i].OrgName.toUpperCase() == "HOL-ELW-002") {
      valFunc.getELWStatus(orgId, rToken, function(sddc) {
        console.log(JSON.stringify(sddc.length));
        if (sddc.length == 2) {
          //do nothing for now
          //bot.reply(message, "I couldn't find any workshop SDDC's deployed.");
        } else {
          var sddcStr = JSON.parse(sddc);
          //var jsonStr = JSON.parse(sddcStr);
          //bot.reply(message, "A total of *" + sddcStr.length + "* SDDC's are deploying or have been deployed.");
          //console.log("results:" + sddcStr.length);

          for (var s = 0; s < sddcStr.length; s++) {
            if (sddcStr[s].sddc_state == "READY") {
              r = r + 1;
            }
            var sddcMessage = '' +
              '*SDDC Name:* ' + sddcStr[s].name + ' ' +
              '*SDDC State:* ' + sddcStr[s].sddc_state + '\n';
            bot.reply(message, sddcMessage);
          }
        }
      });
      //}
      i++;
    }
    //if (i == 50) {
    bot.say({
      text: "Ready: *" + r + "*"
    });
    //  }
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

  function deployELWSDDC(callback) {
    execSh(["/data/bender/vmc/create_elw_sddc.sh"], true,
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

  function deleteELWSDDC(callback) {
    execSh(["/data/bender/vmc/delete_elw_sddc.sh"], true,
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
