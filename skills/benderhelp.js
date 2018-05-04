module.exports = function(controller) {
  //module.exports.use = function(controller) {
  controller.hears('help', 'direct_message,direct_mention,mention', function(bot, message) {
    var botName = '@' + bot.identity.name,
      helpMessage;

    helpMessage = '' +
      'I\'m here to help! Here are some of the commands available to assist you with. ' +
      'For more information about the POC process visit the confluence page - https://confluence.eng.vmware.com/display/CloudSE/Technical+Validation \n\n' +

      '_Tech Validation Tracker:_\n' +
      '`' + botName + ' add <POC or Paid Pilot> for <Account Name>`: Adds new entry for the tech validation tracker into Mode Analytics.\n' +
      '`' + botName + ' get <Account Name> or show <Account Name>`: Gets customer information from the validation tracker.\n' +
      '`' + botName + ' update <Account Name>`: Update fields in validation tracker. Wild Cards can be used (*)\n' +
      '`' + botName + ' What is <SE Name> working on`: Lists all Technical Validations that an Solution Engineer is assigned to.\n' +
      '`' + botName + ' create new org`: Creates invite for new POC org.\n' +
      '`' + botName + ' get <Account Name> sddc`: Get basic information about the customers SDDC.\n' +
      '\n' +
      '_VMC:_\n' +
      '`' + botName + ' add <email> to <vmc-ws#>`: Add student to workshop org.\n' +
      '`' + botName + ' remove <email> from <vmc-ws#>`: remove student from workshop org\n' +
      '`' + botName + ' create new org`: Creates invite for new POC org.\n' +
      '';

    bot.reply(message, helpMessage);
  });
};
