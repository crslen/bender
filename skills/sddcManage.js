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
            var env = message.match[1].toLowerCase();
            var sddc = message.match[2];
            console.log(message.match[1]);
            if (env == 'elw') {
              var chnl = '#vmc-se-elw';
              var jsonWKS = require("../json/elw.json");
            } else {
              var chnl = '#vmc-workshops';
              var jsonWKS = require("../json/workshop.json");
            }
            //console.log(jsonWKS);
            jsonStr = JSON.stringify(jsonWKS);
            obj = JSON.parse(jsonStr);
            var i = 0;
            if (sddc.toLowerCase() == 'all') {
              if (env == 'elw') {
                deleteELWSDDC(function callback(results) {
                  console.log("stdout again: ", results);
                  bot.reply(message, "Results:\n" + results);
                  bot.say({
                    channel: chnl,
                    text: "Deleting elw workshops SDDCs 1 thru 50.  The following have been started: \n" + results
                  });
                });
              } else {
                deleteSDDC(function callback(results) {
                  console.log("stdout again: ", results);
                  bot.reply(message, "Results:\n" + results);
                  bot.say({
                    channel: chnl,
                    text: "Deleting workshops SDDCs 1 thru 20.  The following have been started: \n" + results
                  });
                });
              }
              //bot.reply(message, "Deleting elw workshops 1 thru 50.  I'll share the results once complete, which may take up to 10 minutes.")
            }
            while (i < obj.length) {
              //for (var i = 0; i < obj.length; i++) {
              if (obj[i].OrgName.toUpperCase() == sddc.toUpperCase()) {
                console.log(JSON.stringify(obj[i]));
                provider = obj[i].Provider;
                valFunc.deleteSDDC(obj[i].OrgId, obj[i].RefreshToken, function(res) {
                  var jsonParse = JSON.stringify(res);
                  var jsonStr = JSON.parse(res);
                  console.log("response: " + jsonStr);
                  if (jsonStr.status == "STARTED") {
                    bot.reply(message, "Removal of *" + jsonStr.params.SDDC_DELETE_CONTEXT_PARAM.sddc_id + "* has *" + jsonStr.status + "*. ");
                    bot.say({
                      channel: chnl,
                      text: "Removal of *" + jsonStr.params.SDDC_DELETE_CONTEXT_PARAM.sddc_id + "* has *" + jsonStr.status + "*."
                    });
                  } else {
                    bot.reply(message, "Error message *" + jsonStr.status + "*.");
                    bot.say({
                      channel: chnl,
                      text: "Error message *" + jsonStr.status + "*."
                    });
                  }
                });
              }
              i++;
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
            var env = message.match[1].toLowerCase();
            var sddc = message.match[2];
            console.log(message.match[1]);
            if (env == 'elw') {
              var chnl = '#vmc-se-elw';
              var jsonWKS = require("../json/elw.json");
            } else {
              var chnl = '#vmc-workshops';
              var jsonWKS = require("../json/workshop.json");
            }
            //console.log(jsonWKS);


            jsonStr = JSON.stringify(jsonWKS);
            obj = JSON.parse(jsonStr);
            var i = 0;
            var sddcreg = /^([0-9]|[1-9][0-9])$/;
            if (sddc.toLowerCase() == 'all' || sddcreg.test(sddc)) {
              if (env == 'elw') {
                if (sddc.toLowerCase() == 'all') {
                  sddc = 50;
                }
                deployELWSDDC(sddc, function callback(results) {
                  console.log("stdout again: ", results);
                  bot.reply(message, "Results:\n" + results);
                  //put results in #vmc-se-elw channel
                  bot.say({
                    channel: chnl,
                    text: "Deploying elw workshops 1 thru " + sddc + ".  The following have been started: \n" + results
                  });
                });
              } else {
                if (sddc.toLowerCase() == 'all') {
                  sddc = 20;
                }
                deploySDDC(sddc, function callback(results) {
                  console.log("stdout again: ", results);
                  bot.reply(message, "Results:\n" + results);
                  //put results in #vmc-se-elw channel
                  bot.say({
                    channel: chnl,
                    text: "Deploying workshops 1 thru " + sddc + ".  The following have been started: \n" + results
                  });
                });
              }
              //bot.reply(message, "Deploying elw workshops 1 thru 50. You can ask me `@bender get elw status` to see if all have been deployed succesfully.")
            } else {
              while (i < obj.length) {
                //for (var i = 0; i < obj.length; i++) {
                if (obj[i].OrgName.toUpperCase() == sddc.toUpperCase()) {
                  console.log(JSON.stringify(obj[i]));
                  provider = obj[i].Provider;
                  console.log("Found token: " + obj[i].RefreshToken + " and org: " + obj[i].OrgId + " and name: " + obj[i].SDDCName + " and region: " + obj[i].Region + " and hosts: " + obj[i].NumHosts);
                  valFunc.deploySDDC(obj[i].OrgId, obj[i].SDDCName, obj[i].SubnetId, obj[i].CIDR, obj[i].Provider, obj[i].RefreshToken, obj[i].Region, obj[i].NumHosts, obj[i].NetworkSegment, function(res) {
                    var jsonParse = JSON.stringify(res);
                    var jsonStr = JSON.parse(jsonParse);
                    console.log("response: " + jsonStr.status);
                    if (jsonStr.status == "STARTED") {
                      bot.reply(message, "Deployment of *" + jsonStr.params.sddcConfig.name + "* has *" + jsonStr.status + "*.");
                      bot.say({
                        channel: chnl,
                        text: "Deployment of *" + jsonStr.params.sddcConfig.name + "* has *" + jsonStr.status + "*."
                      });
                    } else {
                      bot.reply(message, "Error message *" + jsonStr.status + "*.");
                      bot.say({
                        channel: chnl,
                        text: "Error message *" + jsonStr.status + "*."
                      });
                    }
                  });
                }
                i++;
              }
            }
          }
        });
      } else {
        bot.reply(message, "Sorry you do not have access to perform this operation.");
      }
    });
  });

  controller.hears(['get (.*) status'], 'direct_message,direct_mention,mention', (bot, message) => {
    //var customer = message.match[1];
    bot.reply(message, "Checking status....");
    var env = message.match[1].toLowerCase();
    if (env == 'elw') {
      var jsonWKS = require("../json/elw.json");
    } else {
      var jsonWKS = require("../json/workshop.json");
    }
    jsonStr = JSON.stringify(jsonWKS);
    obj = JSON.parse(jsonStr);
    var i = 0;
    var r = 0;
    var sddcMessage = '';
    var sddcResults = '';
    while (i < obj.length) {
      var rToken = obj[i].RefreshToken;
      var orgId = obj[i].OrgId;
      valFunc.getELWStatus(orgId, rToken, function(sddc) {
        if (sddc.length == 2) {
          console.log("results:" + sddc.length);
          //do nothing for now
          //bot.reply(message, "I couldn't find any workshop SDDC's deployed.");
        } else {
          var sddcStr = JSON.parse(sddc);
          //var jsonStr = JSON.parse(sddcStr);
          //bot.reply(message, "A total of *" + sddcStr.length + "* SDDC's are deploying or have been deployed.");
          console.log("results:" + sddcStr.length);
          for (var s = 0; s < sddcStr.length; s++) {
            if (sddcStr[s].sddc_state == "READY") {
              r = r + 1;
            }
            sddcMessage = '' +
              '*SDDC Name:* ' + sddcStr[s].name + ' ' +
              '*SDDC State:* ' + sddcStr[s].sddc_state + '\n';
            bot.reply(message, sddcMessage);
          }
          //return sddcMessage;
        }
        console.log("sddcmsg=: " + r);
      });
      if (env == "workshop") {
        i = i + 1; //skip very other json workshop entry
      }
      //if (i == sddc.Length) {
      //  sddcResults = '' +
      //   'Total SDDCs ready: *' + r + '*\n';
      //  bot.reply(message, sddcResults);
      //}
      i++;
    }
  });

  controller.hears(['configure (.*) horizon'], 'direct_message,direct_mention,mention', (bot, message) => {
    //var customer = message.match[1];
    bot.reply(message, "Ok prepping SDDC's for Horizon this may take a few minutes....");
    var env = message.match[1].toLowerCase();
    if (env == 'elw') {
      var jsonWKS = require("../json/elw.json");
    } else {
      var jsonWKS = require("../json/workshop.json");
    }
    execPSFile('workshop-config-horizon.ps1', function callback(results) {
      console.log("stdout again: ", results);
      bot.reply(message, "Results:\n" + results);
      /*bot.say({
        channel: chnl,
        text: "Deleting workshops SDDCs 1 thru 20.  The following have been started: \n" + results
      });*/
    });
  });

  controller.hears(['reset workshop password to (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    var password = message.match[1];
    bot.reply(message, "ok resetting domain accounts vmcws* passwords to " + password + "....");

    execPSFile(`reset-WorkshopUser-Passwords-Bender.ps1 ${password}`, function callback(results) {
      console.log("stdout again: ", results);
      var chnl = '#vmc-workshops';
      bot.reply(message, "Results:\n" + results);
      bot.say({
        channel: chnl,
        text: "Please note the vmcws# student accounts have all been updated with a new password `" + password + "`. Please communicate this information to the students in your workshop"
      });
    });
  });

  function execPSFile(psFile, callback) {
    execSh([`pwsh -nologo -noprofile /data/bender/vmc/workshops/executeFile.ps1 "${psFile}"`], true,
      function(err, stdout, stderr) {
        console.log("error: ", err);
        console.log("stdout: ", stdout);
        console.log("stderr: ", stderr);
        return callback(stdout);
      });
  }

  function deploySDDC(sddc, callback) {
    execSh([`/data/bender/vmc/create_sddc.sh ${sddc}`], true,
      function(err, stdout, stderr) {
        console.log("error: ", err);
        console.log("stdout: ", stdout);
        console.log("stderr: ", stderr);
        return callback(stdout);
      });
  }

  function deployELWSDDC(sddc, callback) {
    execSh([`/data/bender/vmc/create_elw_sddc.sh ${sddc}`], true,
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

}; /* the end */
