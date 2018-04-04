var Botkit = require('botkit')
  , usersController = require('./controller/users-controller')
  , summaryController = require('./controller/summary-controller')
  , standupController = require('./controller/standup-controller')
  , helpController = require('./controller/help-controller')
  , controller
  , redisStorage = require('botkit-storage-redis')({
      namespace: 'standup',
      url: process.env.REDIS_URL
    });

controller = Botkit.slackbot({
  debug: true,
  storage: redisStorage
});

// connect the bot to a stream of messages
controller.spawn({
	token: 'xoxb-316483430950-saP6xXBGg9nZmgCCtaZqKf3h'
}).startRTM(function(err, bot) {
  require('./model/users-model').init(controller, bot);
  require('./model/standup-model').init(controller, bot);
});

usersController.use(controller);
summaryController.use(controller);
standupController.use(controller);
helpController.use(controller);

