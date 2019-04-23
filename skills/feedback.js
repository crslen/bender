var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
var valFunc = require('../model/valFunctions');
var execSh = require("exec-sh");
var colorArray = ['#629aca', '#9ecbde', '#6392ac', '#e6f1f7', '#64818f'];

let fbTime = [
  {
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


module.exports = function(controller) {

  controller.on('interactive_message_callback', function(bot, trigger) {
    console.log("action: " + JSON.stringify(trigger.actions[0]))
    // is the name of the clicked button "dialog?"
    if (trigger.actions[0].value == 'select-feedback') {

          var dialog = bot.createDialog(
                'Feedback',
                trigger.callback_id,
                'Submit'
              ).addTextarea('Impact','Impact','',{placeholder: 'If this is not resolved, what is the impact?'})
               .addSelect('Timeline','timeline',null,fbTime,{placeholder: 'Select One'})
               .addTextarea('Summary','summary','',{placeholder: 'Provide a summary of the feedback'});
               
          bot.replyWithDialog(trigger, dialog.asObject(), function(err, res) {
            // handle your errors!
            //bot.reply("I ran into an issue: " + err);
          });
      }
  
  });

  // handle a dialog submission
  // the values from the form are in event.submission    
  controller.on('dialog_submission', function(bot, message) {
    var submission = message.submission;
        //splice the actions
        var ids = message.callback_id.split('|');
        var customer = ids[3];
        var cso = ids[4];
        var category = ids[1];
        var area = ids[2];
    console.log("submission: " + JSON.stringify(submission));
    getSentiment(submission.summary, function callback(results) {
      console.log("resultsoutput: " + results);
      var jsonParse = JSON.parse(results);
      var jsonInput = {
        "event": "vmc_aws_feedback",
        "userId": "bender@vmware.com",
        "properties": {
          "category": category,
          "area": area,
          "customer_name": customer,
          "cso": cso,
          "impact": submission.Impact,
          "summary": submission.summary,
          "timeline": submission.timeline,
          "sentiment": jsonParse.Sentiment,
          "sentiment_score": jsonParse.SentimentScore,
          jsonParse,
          "origin": "slack"
        }
      }
      valFunc.insertSegment(jsonInput, function(res) {
        console.log("segment response: " + res);
      });
    });
    bot.reply(message, 'Got it!');

    // call dialogOk or else Slack will think this is an error
    bot.dialogOk();
  });

  controller.hears(['(new|add|give|create) feedback for (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
        
    bot.startConversation(message, function(err, convo) {
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
        callback: function(response, convo) {
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
    
        valFunc.getSFDC(customer, null, function(res) {
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

  controller.hears(['export one thing report'], 'direct_message,direct_mention,mention', (bot, message) => {

    bot.reply(message, "Please hold.....");
    valFunc.getOTR(function(res) {
      if (res.length == 0) {
        bot.reply(message, {
          text: "Hmm something bad happend, I can't query this information."
        });
      } else {
        var jsonParse = JSON.stringify(res);
        console.log("return: " + jsonParse);
        var jsonStr = JSON.parse(jsonParse);

        for (var i = 0; i < jsonStr.length; i++) {
          var date = new Date(jsonStr[i].datetime_created)
          var otDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          bot.reply(message, {
            text: "`" + otDate + "` - " + jsonStr[i].the_one_thing + " *" + jsonStr[i].specialist + "*"
          });
        }
      }
    });
  });

  function getSentiment(summaryTxt, callback) {
    execSh([`aws comprehend detect-sentiment --language-code 'en' --text "${summaryTxt}"`], true,
      function(err, stdout, stderr) {
        console.log("error: ", err);
        console.log("stdout: ", stdout);
        console.log("stderr: ", stderr);
        return callback(stdout);
      });
  }

}; /*the end*/
