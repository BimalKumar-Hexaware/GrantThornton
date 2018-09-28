var helper = require('./helper');
var _ = require('lodash');
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
                    console.log("callDynamicsAPI result body value", JSON.stringify(result.value));
                    var response = {
                        "fulfillmentMessages": []
                    };
                    if (result.value.length) {
                        _.forEach(result.value, function (value, key) {
                            if (key < 3) {
                                response.fulfillmentMessages.push({
                                    "card": {
                                        "title": value.name,
                                        "subtitle": "Revenue " + value.estimatedvalue
                                    },
                                    "platform": "SKYPE"
                                });
                            }
                        });
                    } else {
                        response.fulfillmentMessages.push({
                            "text": {
                                "text": [
                                    "Unable to find opportunities."
                                ]
                            },
                            "platform": "SKYPE"
                        });
                    }
                    response.fulfillmentMessages.push({
                        "text": {
                            "text": [
                                "Is there anything else that I can help you with?"
                            ]
                        },
                        "platform": "SKYPE"
                    });
                    console.log("response", response);
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
                var test = _.result(_.find(req.body.queryResult.outputContexts, function(obj) {
                    return obj.name === 'projects/grantthornton-f364a/agent/sessions/876dd9f4-7c42-422f-81b9-0dc4ff899434/contexts/selected_status';
                }), 'id');
                console.log("test",test);
                console.log("Parameters", parameters);
                return helper.callDynamicsAPI(parameters).then((result) => {
                    console.log("callDynamicsAPI result body value", JSON.stringify(result.value));
                    var response = {
                        "fulfillmentMessages": []
                    };
                    if (result.value.length) {
                        _.forEach(result.value, function (value, key) {
                            if (key < 3) {
                                response.fulfillmentMessages.push({
                                    "card": {
                                        "title": value.name,
                                        "subtitle": "Revenue " + value.estimatedvalue
                                    },
                                    "platform": "SKYPE"
                                });
                            }
                        });
                    } else {
                        response.fulfillmentMessages.push({
                            "text": {
                                "text": [
                                    "Unable to find opportunities."
                                ]
                            },
                            "platform": "SKYPE"
                        });
                    }
                    response.fulfillmentMessages.push({
                        "text": {
                            "text": [
                                "Is there anything else that I can help you with?"
                            ]
                        },
                        "platform": "SKYPE"
                    });
                    console.log("response", response);
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