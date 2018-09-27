var express = require('express'),
    router = express.Router()
    controller = require('./controller');

router.post('/api/webhook', controller.webhookRequestHandler);

module.exports = router;
