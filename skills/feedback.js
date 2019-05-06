//redshift.js
var Redshift = require('node-redshift');

var client = {
  user: process.env.RSuser,
  database: process.env.RSdatabase,
  password: process.env.RSpassword,
  port: process.env.RSport,
  host: process.env.RShost,
  ssl: true,
};

var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
var valFunc = require('../model/valFunctions');
var execSh = require("exec-sh");
var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];

let fbTime = [{
    "label": "Immediate",
    "value": "Immediate"
  },
  {
    "label": "3-6 months",
    "value": "3-6 months"
  },
  {
    "label": "6-12 months",
    "value": "6-12 months"
  },
  {
    "label": "1 year +",
    "value": "1 year +"
  }
];


module.exports = function (controller) {

  controller.on('interactive_message_callback', function (bot, trigger) {
    console.log("action: " + JSON.stringify(trigger.actions[0]))
    // is the name of the clicked button "dialog?"
    if (trigger.actions[0].value == 'select-feedback' || trigger.actions[0].value == 'Yes-feedback') {
      var dialog = bot.createDialog(
          'Feedback',
          trigger.callback_id,
          'Submit'
        ).addTextarea('Impact', 'Impact', '', {
          placeholder: 'If this is not resolved, what is the impact?'
        })
        .addSelect('Urgency', 'Urgency', null, fbTime, {
          placeholder: 'Select One'
        })
        .addTextarea('Summary', 'summary', '', {
          placeholder: 'Provide a summary of the feedback'
        })
        .addTextarea('Loss Summary', 'lossSummary', '', {
          placeholder: '(Optional) If this is a lost opportunity, please provide addtional details.'
        });

      bot.replyWithDialog(trigger, dialog.asObject(), function (err, res) {
        // handle your errors!
        //bot.reply("I ran into an issue: " + err);
      });
    } else if (trigger.actions[0].value == 'update-feedback') {
      var ids = trigger.callback_id.split('|');
      var timeline = ids[0];
      var jsonResults = ids[1];
      console.log(trigger.callback_id);
      var jsonStr = JSON.stringify(jsonResults);
      console.log("csname: " + jsonResults);
      var dialog = bot.createDialog(
          'Feedback',
          trigger.callback_id,
          'Update'
        ).addTextarea('Impact', 'Impact', '', {
          placeholder: 'If this is not resolved, what is the impact?'
        })
        .addSelect('Urgency', 'Urgency', timeline, fbTime, {
          placeholder: 'Select One'
        })
        .addTextarea('Summary', 'summary', jsonResults, {
          placeholder: 'Provide a summary of the feedback'
        });

      bot.replyWithDialog(trigger, dialog.asObject(), function (err, res) {
        // handle your errors!
        //bot.reply("I ran into an issue: " + err);
      });

    } else {
      if (trigger.actions[0].value == 'No-feedback') {
        bot.reply(trigger, "Ok going back to my hole. Byeeee!");
      }
    }
  });

  // handle a dialog submission
  // the values from the form are in event.submission    
  controller.on('dialog_submission', function (bot, message) {
    var submission = message.submission;
    //splice the actions
    var ids = message.callback_id.split('|');
    var customer = ids[3];
    var cso = ids[4];
    var category = ids[1];
    var area = ids[2];
    //get submitter
    bot.api.users.info({
      user: message.user
    }, (error, response) => {
      let {
        name,
        real_name
      } = response.user;

      console.log("submission: " + JSON.stringify(submission));
      awsComprehend(submission.summary, function callback(results) {
        console.log("resultsoutput: " + results);
        var jsonParse = JSON.parse(results);
        var jsonInput = {
          "event": "vmc_aws_feedback",
          "userId": "bender@vmware.com",
          "properties": {
            "category": category,
            "area": area,
            "customer_partner_name": customer,
            "cso": cso,
            "impact": submission.Impact,
            "summary": submission.summary,
            "urgency": submission.Urgency,
            "sentiment": jsonParse.Sentiment,
            "sentiment_score": jsonParse.SentimentScore,
            "keyPhrases": jsonParse.KeyPhrases,
            "loss_summary": submission.lossSummary,
            "origin": "slack",
            "submitted_by": real_name
          }
        }
        valFunc.insertSegment(jsonInput, function (err, res) {
          if (err) {
            console.log("segment error: " + err);
          }
          console.log("segment response: " + res);
        });
      });
    });
    bot.reply(message, 'Thank you for your feedback, your information been recorded into our tracking database and will be included in our rollups to the Business Unit.  Please consider submitting an idea to resolve this at https://vmwonaws.ideas.aha.io/ideas.');
    // call dialogOk or else Slack will think this is an error
    bot.dialogOk();
  });

  controller.hears(['(new|add|give|create) feedback for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    bot.startConversation(message, function (err, convo) {
      convo.ask({
        attachments: [{
          title: "Select a category?",
          callback_id: 'fbCategory',
          attachment_type: 'default',
          color: colorArray,
          actions: [{
            "name": "category",
            "text": "Select Category...",
            "type": "select",
            "option_groups": fields.fbArea()
          }]
        }]
      }, [{
        default: true,
        //pattern: "category",
        callback: function (response, convo) {
          console.log("response:" + JSON.stringify(response));
          //console.log("response:" + response.actions[0].selected_options[0]);
          /*if (JSON.stringify(catList).indexOf(actCat) >= 0) {
            askNotes(response, convo);
            convo.next();
          } else {
            bot.reply(message, "You didn't select anything in the dropdown.  Try again.");
            askActivity(response, convo);
            convo.next();
          }*/
          //convo.gotoThread('Q2');
          askSFDC(response, convo);
          convo.next();
        }
      }]);
      //ask if you want to update another field
      let askSFDC = (response, convo) => {
        var activity; //customer name
        var category = "";
        var customer = "";
        var CatArea = response.text;
        console.log(CatArea);

        customer = message.match[2];

        bot.reply(message, {
          text: "Searching opportunities for " + customer + "....."
        });

        valFunc.getSFDC(customer, null, function (res) {
          if (res.length == 0) {
            bot.reply(message, {
              text: "I couldn't find any opportunities for " + customer + " :shocked:"
            });
            bot.reply(message, {
              attachments: [{
                title: 'You still want to enter feedback?',
                callback_id: 'actions-feedback|' + CatArea + '|' + customer + "|null",
                attachment_type: 'default',
                actions: [{
                    "name": "yes",
                    "text": "Yes",
                    "value": "Yes-feedback",
                    "type": "button",
                  },
                  {
                    "name": "no",
                    "text": "No",
                    "value": "No-feedback",
                    "type": "button",
                  }
                ]
              }]
            });
          } else {
            var jsonParse = JSON.stringify(res);
            console.log("return: " + jsonParse);
            var jsonStr = JSON.parse(jsonParse);
            bot.reply(message, "If possible select a Cloud Opportunity");

            for (var i = 0; i < jsonStr.length; i++) {

              var sfMessage = '' +
                '*Account Name:* ' + jsonStr[i].account_name + '\n' +
                '*Opportunity ID:* ' + jsonStr[i].opportunity_number + ' or ' + jsonStr[i].opportunity_name + '\n' +
                '*Opportunity Type:* ' + jsonStr[i].record_type + '\n' +
                '*Stage:* ' + jsonStr[i].opportunity_stage + '\n' +
                '*Date Created:* ' + jsonStr[i].opportunity_create_date + '\n' +
                '*Opportunity Owner:* ' + jsonStr[i].opportunity_owner_name + '\n';

              bot.reply(message, {
                //text: "Here's what I found for " + customer,
                attachments: [{
                  "text": sfMessage,
                  "color": colorArray[i],
                  callback_id: 'actions-feedback|' + CatArea + '|' + jsonStr[i].account_name + "|" + jsonStr[i].opportunity_number,
                  actions: [{
                    "name": "select",
                    "text": "Select",
                    "value": "select-feedback",
                    "type": "button",
                  }],
                }]
              });
            }
          }
        });
      };
    });
  });

  controller.hears(['Update feedback for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    var customer = "";
    customer = message.match[1];
    bot.reply(message, "Searching feedback please hold.....");
    getFeedback(customer, function (res) {
      if (res.length == 0) {
        bot.reply(message, {
          text: "I couldn't find any feedback for " + customer
        });
      } else {
        var jsonParse = JSON.stringify(res);
        console.log("return: " + jsonParse);
        var jsonStr = JSON.parse(jsonParse);
        bot.reply(message, "Select feedback to update");

        for (var i = 0; i < jsonStr.length; i++) {

          var sfMessage = '' +
            '*Customer Name:* ' + jsonStr[i].customer_name + '\n' +
            '*Category:* ' + jsonStr[i].category + '\n' +
            '*Area:* ' + jsonStr[i].area + '\n' +
            '*Impact:* ' + jsonStr[i].impact + '\n' +
            '*Submitted By:* ' + jsonStr[i].submitted_by + '\n';

          bot.reply(message, {
            //text: "Here's what I found for " + customer,
            attachments: [{
              "text": sfMessage,
              "color": colorArray[i],
              callback_id: jsonStr[i].timeline + '|' + jsonStr[i].summary,
              actions: [{
                "name": "select",
                "text": "Select",
                "value": "update-feedback",
                "type": "button",
              }],
            }]
          });
        }
      }
    });
  });

  function awsComprehend(summaryTxt, callback) {
    execSh(`aws comprehend detect-sentiment --language-code 'en' --text "${summaryTxt}"`, true, function (err, stdout) {
      if (err) {
        console.log("Exit code: ", err.code);
        return;
      }
      var child = execSh([`aws comprehend detect-key-phrases --language-code 'en' --text "${summaryTxt}"`], true,
        function (err, stdout1, stderr) {
          var txtResult = JSON.parse(stdout1);
          results = '"KeyPhrases": "' + getValues(txtResult, 'Text') + '"}';
          stdout = stdout.slice(0, stdout.length - 3) + ",";
          //stdout1 = stdout1.slice(1);
          var finalOut = stdout.concat(results);
          return callback(finalOut);
        });
    });
  }

  //return an array of values that match on a certain key
  function getValues(obj, key) {
    var objects = [];
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
        objects = objects.concat(getValues(obj[i], key));
      } else if (i == key) {
        objects.push(obj[i]);
      }
    }
    return objects;
  }

  //query SFDC data
  function getFeedback(customerName, callback) {
    //redshift Query
    //connection pool
    var redshiftClient = new Redshift(client, {
      rawConnection: true
    })

    redshiftClient.connect(function (err) {
      if (err) throw err;
      else {
        var selQuery;
        selQuery = `select * from set_dev.vmc_aws_feedback where customer_name ilike '%${customerName}%'`;
        // and snapshot_date = (select max(snapshot_date) from vmstar.opportunity)

        redshiftClient.query(selQuery, {
          rawConnection: true
        }, function (err, data) {
          if (err) throw err;
          else {
            console.log(data.rows);
            redshiftClient.close();
            return callback(data.rows);
          }
        });
      }
    });
  }
}; /*the end*/
