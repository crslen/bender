var wordfilter = require('wordfilter');
let fields = require("../model/valFields");
let valFunc = require("../model/valFunctions");
let benderQuestions = require("../model/BenderQuestions");
let badwordsArray = require('badwords/array');

module.exports = function(controller) {

  controller.hears(['Provide Storage Information'], 'direct_message, direct_mention, ambient', function(bot, message) {
    //bot.createConversation(message, function(err, convo) {
    var jsonWKS = benderQuestions.storageQuestions();
    var jsonStr = JSON.stringify(jsonWKS);
    var obj = JSON.parse(jsonStr);
    for (var i = 0; i < obj.length; i++) {
      console.log(obj.questions[i]);
    }
    //convo.say(jsonWKS.Questions[0]);
    //convo.activate();
    //});

  });

  /*  controller.hears(['Provide Storage Information'], 'direct_message,direct_mention,mention', function(bot, message) {
      bot.createConversation(message, function(err, convo) {
        //console.log(json.stringify(benderQuestions.Questions()));
        //var jsonWKS = benderQuestions.Questions();

        convo.ask("Hi?", (response, convo) => {
          partnerName = response.text;
          //askOpp(response, convo);
          convo.next();
        });
      });
    });
  */
  //controller.hears(['fuck', 'butthole', 'asshole', 'jerk', 'dick', 'moron', 'prick', 'idiot', 'fuck puddle', 'putz', 'fuckface'], 'direct_message, direct_mention, ambient', function(bot, message) {
  controller.hears(badwordsArray, 'direct_message, direct_mention', function(bot, message) {

    //if (message.channel == "#dev-bender") {
    //if (message.channel == "G99D12CCA") {
    bot.createConversation(message, function(err, convo) {
      var message_options = [
        "Are you calling me a " + message.text,
        ":waving:",
        "Shhh",
        ":shushing_face:",
        "I know what you are, but what am I?",
        "Do you need some soap to put into your mouth?",
        "Are you talking to me?",
        "Have you seen my stapler?",
        "Is that your real face or are you still celebrating Halloween?",
        "Your bus leaves in 10 minutes... Be under it.",
        "Why don't you go into that corner and finish evolving?",
        "I'm sorry, I don't speak Orc.",
        "Sorry, I can't understand what you're saying... I'm wearing a moron filter.",
        "And yet your misses still prefers me to you.",
        "I'm impressed; I've never met such a small mind inside such a big head before.",
        "What's wrong, don't you get any attention back home?",
        "Did your mother never tell you not to drink on an empty head?",
        ":eggplant: :punch:",
        "Stick it in your :poop: :oven:",
        "Keep rolling your eyes maybe you'll find a brain back there.",
        "I hope one day you choke on the :poo: you talk."
      ]
      var random_index = Math.floor(Math.random() * message_options.length)
      var chosen_message = message_options[random_index]
      convo.say(chosen_message);
      convo.activate();
    });
    //} else {
    //  bot.reply(message, "I only heckle in #dev channel");
    //}

  });

  controller.hears(['paul Hi', 'Hi paul'], 'direct_message, direct_mention, ambient', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      convo.say("Shhh :shushing_face:");
      convo.activate();
    });

  });

  controller.hears(['╯°□°）╯︵ ┻━┻'], 'direct_message, direct_mention, ambient', function(bot, message) {

    bot.createConversation(message, function(err, convo) {
      convo.say("┬─┬ノ( º _ ºノ)");
      convo.say("You're welcome.")
      convo.activate();
    });

  });

  controller.hears(['Hmm'], 'direct_message, direct_mention, ambient', function(bot, message) {
    let yayMsg = fields.futQuotes();
    console.log(yayMsg);
    bot.createConversation(message, function(err, convo) {
      convo.say(":thinking_face:");
      convo.say(yayMsg);
      convo.activate();
    });
  });

  controller.hears(['pound sand'], 'direct_message, direct_mention, ambient', function(bot, message) {
    bot.api.users.info({
      user: message.user
    }, (error, response) => {
      let {
        name,
        real_name
      } = response.user;
      console.log(name, real_name);
      bot.createConversation(message, function(err, convo) {
        convo.say("You pound sand!");
        convo.say("Hi " + real_name + " :waving: ");
        convo.activate();
      });
    })
  });

  controller.hears(['grr'], 'direct_message, direct_mention, ambient', function(bot, message) {

    bot.createConversation(message, function(err, convo) {
      var resp = valFunc.testSegment();
      console.log("resp: " + resp);
      convo.say("Don't beat me!");
      convo.activate();
    });
  });

  /*controller.hears(['extension_reason'], 'message_received', wit.hears, function(bot, message) {

    console.log("Wit.ai detected entities", message.entities);
    bot.reply("Sounds like you need to extend a poc");

  });
*/
  controller.hears(['Shh'], 'direct_message, direct_mention, ambient', function(bot, message) {
    if (valFunc.validateUser(message) == "true") {
      bot.createConversation(message, function(err, convo) {
        var message_options = [
          "it",
          "it-tastic",
          "Shhh back at ya",
          "art",
          "nizzle",
          ":shushing_face:"
        ]
        var random_index = Math.floor(Math.random() * message_options.length)
        var chosen_message = message_options[random_index]
        convo.say(chosen_message);
        convo.activate();
      });
    }
  });

  controller.hears(['set reminder'], 'direct_message, direct_mention', function(bot, message) {

    /*  bot.say({
          channel: "#tech-validation",
          text: "A new entry for <b> customer </b> has been added to the tech validation tracker."
      });*/
    bot.api.users.info({
      user: message.user
    }, (error, response) => {
      let {
        id,
        name,
        real_name
      } = response.user;
      console.log(id, name, real_name);
      bot.api.reminders.add({
        token: process.env.OAUTH_ACCESS_TOKEN,
        text: "update <@" + id + "> validation tracker for <customer>",
        time: "daily at 12:22pm",
        //user: id
        channel: "C6HTFESG6"
      }, (error, response) => {
        console.log(error, response);
        bot.reply(response);
      })
    })
  });

  controller.hears(['([0-9]{1,2}) miles', '([0-9]{1,2}) km', '([0-9]{1,2}) kilometers'], 'direct_message,direct_mention,ambient', function(bot, message) {
    console.log(message);
    if (message.match[1]) {
      if (message.text.indexOf("miles") > -1) {
        var conv = (message.match[1] * 1.609344).toFixed(2);
        bot.reply(message, "Thats " + conv + " km for you metric bit heads.")
      }
      if (message.text.indexOf("km") > -1 || message.text.indexOf("kilometers") > -1) {
        var conv = (message.match[1] / 1.609344).toFixed(2);
        bot.reply(message, "Thats " + conv + " miles for you non-metric bit heads.")
      }
    }
  });

  controller.hears(['^say (.*)', '^say'], 'direct_message,direct_mention', function(bot, message) {
    if (message.match[1]) {

      if (!wordfilter.blacklisted(message.match[1])) {
        bot.reply(message, message.match[1]);
      } else {
        bot.reply(message, '_sigh_');
      }
    } else {
      bot.reply(message, 'I will repeat whatever you say.')
    }
  });

  function getChannelId(chName, callback) {
    bot.api.channels.list({}, (error, response) => {
      //console.log(response);
      jsonStr = JSON.stringify(response);
      obj = JSON.parse(jsonStr);
      console.log("parse: " + jsonStr)
      for (var i = 0; i < obj.channels.length; i++) {

        //if (obj[i].channels.name == chName) {
        console.log("Found: " + obj[i].name + " id: " + obj[i].id);
        chId = obj[i].id;
        return callback(chId);
        //orgId = obj[i].OrgId;
        //}
      }
    });
  }
};
