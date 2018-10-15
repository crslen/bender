var valFunc = require('../model/valFunctions');

module.exports = function(controller) {
  //module.exports.use = function(controller) {
  controller.hears('help', 'direct_message,direct_mention,mention', function(bot, message) {
    var benderQuestions = require("../json/BenderQuestions.json");
    var botName = '@bender',
      i = 0,
      dataCollection = "",
      helpMessage;

    while (i < benderQuestions.length) {
      dataCollection = dataCollection + '`' + botName + ' ' + benderQuestions[i].helper + '`: ' + benderQuestions[i].description + '.\n'
      i++
    }

    helpMessage = '' +
      'I\'m here to help! Here are some of the commands available to assist you with. ' +
      'For more information about the POC process visit the confluence page - https://confluence.eng.vmware.com/display/CloudSE/Technical+Validation \n' +

      '\n' +
      '_Tech Validation Tracker:_\n' +
      '`' + botName + ' add <POC or Partner POC or Paid Pilot> for <Account Name>`: Adds new entry for the tech validation tracker into Mode Analytics.\n' +
      '`' + botName + ' get <Account Name> or show <Account Name>`: Gets customer information from the validation tracker.\n' +
      '`' + botName + ' update <Account Name>`: Update fields in validation tracker. Wild Cards can be used (*)\n' +
      '`' + botName + ' What is <SE Name> working on`: Lists all Technical Validations that an Solution Engineer is assigned to.\n' +
      '`' + botName + ' create new org`: Creates invite for new POC org.\n' +
      '`' + botName + ' get <Account Name> sddc`: Get basic information about the customers SDDC.\n' +
      '`' + botName + ' get <Account Name> or <SF OPP ID> sf opp`: Get basic information about a cloud or managed sales opportunity.\n' +
      '`' + botName + ' new activity for <Account Name>`: Add an entry for tracking activities i.e. demo, presentation, workshop etc.\n' +
      '`' + botName + ' get activities for <Account Name>`: Return all SET activities for an account.\n' +

      '\n' +
      '_VMC Workshops:_\n' +
      '`' + botName + ' deploy workshop <workshop org name>`: Deploy SDDC in a workshop org (VMC-WS#).\n' +
      '`' + botName + ' deploy workshop all`: Deploy all 10 SDDCs in VMC workshop.\n' +
      '`' + botName + ' deploy workshop <numeric value>`: Deploy X number of SDDCs in VMC workshop.\n' +
      '`' + botName + ' delete workshop <workshop org name>`: Delete SDDC in a workshop org (VMC-WS#)).\n' +
      '`' + botName + ' delete workshop all`: Deletes all 10 SDDCs in a workshop.\n' +
      '`' + botName + ' add <email> to <vmc-ws#>`: Add student to workshop org.\n' +
      '`' + botName + ' remove <email> from <vmc-ws#>`: Remove student from workshop org.\n' +
      '`' + botName + ' get workshop status`: Gets the status of SDDCs running in the workshop orgs.\n' +

      '\n' +
      '_Misc:_\n' +
      '`' + botName + ' new one thing report`: Adds your one thing you want to share with upper management.\n' +
      '`' + botName + ' show|find|get compliance <search item>`: Search CIAQ database for Vendor Risk Managment, RFP\'s and other stuff.\n' +
      '`' + botName + ' show|find|get roadmap <search item>`: Search public facing VMC roadmap database for features that are available, in development or planned.\n' +

      '\n' +
      '_BU Data Collection:_\n' + dataCollection + '' +

      //valFunc.validateUser(bot, message, function(cb) {
      //  if (cb == 1) {
      //helpMessage = helpMessage + '' +
      '\n' +
      '_VMC Expert Led Workshops (restricted access):_\n' +
      '`' + botName + ' deploy elw <elw org name>`: Deploy SDDC in a ELW org (HOL-ELW-###).\n' +
      '`' + botName + ' deploy elw all`: Deploy all 50 SDDCs in ELW.\n' +
      '`' + botName + ' deploy elw <numeric value>`: Deploy X number of SDDCs in ELW.\n' +
      '`' + botName + ' delete elw <elw org name>`: Delete SDDC in a ELW org (HOL-ELW-###).\n' +
      '`' + botName + ' delete elw all`: Delete all 50 SDDCs in ELW.\n' +
      '`' + botName + ' get elw status`: Gets the status of SDDCs running in the ELW orgs.\n' +
      '`' + botName + ' add elw users`: Adds all users to ELW orgs.\n' +
      '`' + botName + ' remove elw users`: Removes all users from ELW orgs.\n';
    //  }
    //  });

    bot.reply(message, helpMessage);
  });

  /*controller.hears('one thing help', 'direct_message,direct_mention,mention', function(bot, message) {
    var botName = '@' + bot.identity.name,
      helpMessage;

    helpMessage = '' +
      '1 - Please answer the following question: "If you had 30 seconds with Pat Gelsinger or Andy Jassy\’s, what is the one thing you would want them to know about VMC this week?". ' +
      '2 - If you don’t have a good answer to #1, don’t send me an update.' +
      '3 - If your answer is more than one to two sentences (max), you’re doing it wrong.' +
      '';

    bot.reply(message, helpMessage);
  });
  */
};
