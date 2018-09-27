var helper = require('./helper');
module.exports = {
    "webhookRequestHandler": (req, res) => {
        console.log("Dialogflow request body", JSON.stringify(req.body));
        console.log("DF Action", req.body.queryResult.action);
        var parameters = {};

        switch (req.body.queryResult.action) {
            case "gt.userquery-applyfilter-date-supplydate":
                var contextCount = req.body.queryResult.outputContexts.length;
                parameters = req.body.queryResult.outputContexts[contextCount - 1].parameters;
                console.log("Parameters", parameters);
                return helper.callDynamicsAPI(parameters).then((result) => {
                    var response = {
                        "fulfillmentMessages": [{
                            "text": {
                                "text": [
                                    "Sorry, something went wrong"
                                ]
                            },
                            "platform": "SKYPE"
                        }]
                    };
                    /*_.forEach(result.value, function (value, key) {
                        response.fulfillmentMessages.push({
                            "card": {
                                "title": value.name,
                                "subtitle": "Revenue " + value.estimatedvalue
                            },
                            "platform": "SKYPE"
                        });
                    });*/
                    res.json(response);
                }).catch((err) => {
                    console.log("Some error occured", err);
                    res.json({
                        "fulfillmentMessages": [
                            {
                                "text": {
                                    "text": [
                                        "date success"
                                    ]
                                },
                                "platform": "SKYPE"
                            }
                        ]
                    });
                });
                break;
            case "gt.userquery-applyfilter-revenue-ranges":
                parameters = req.body.queryResult.outputContexts[0].parameters;
                console.log("Parameters", parameters);
                return helper.callDynamicsAPI(parameters).then((result) => {
                    console.log("callDynamicsAPI result body value", JSON.stringify(result.value));
                    var response = {
                        "fulfillmentMessages": []
                    };
                    _.forEach(result.value, function (value, key) {
                        response.fulfillmentMessages.push({
                            "card": {
                                "title": value.name,
                                "subtitle": "Revenue " + value.estimatedvalue
                            },
                            "platform": "SKYPE"
                        });
                    });
                    res.json(response);
                }).catch((err) => {
                    console.log("Some error occured", err);
                    res.json({
                        "fulfillmentMessages": [
                            {
                                "text": {
                                    "text": [
                                        "Sorry, something went wrong"
                                    ]
                                },
                                "platform": "SKYPE"
                            }
                        ]
                    });
                });
                break;
        }
    }
};