var helper = require('./helper');
module.exports = {
    "webhookRequestHandler": (req, res) => {
        console.log("Dialogflow request body", JSON.stringify(req.body));
        console.log("DF Action", req.body.queryResult.action);
        var parameters = (typeof req.body.queryResult.outputContexts[0].parameters !== "undefined") ? req.body.queryResult.outputContexts[0].parameters : {};
        console.log("Parameters", parameters);
        switch (req.body.queryResult.action) {
            case "gt.userquery-applyfilter-date-supplydate":
                return helper.callDynamicsAPI(parameters).then((result) => {
                    res.json({
                        "fulfillmentMessages": [
                            {
                                "text": {
                                    "text": [
                                        "api call success"
                                    ]
                                },
                                "platform": "SKYPE"
                            }
                        ]
                    });
                }).catch((err) => {
                    console.log("some error occured");
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
            case "gt.userquery-applyfilter-revenue-ranges":
                return helper.callDynamicsAPI(parameters).then((result) => {
                    res.json({
                        "fulfillmentMessages": [
                            {
                                "text": {
                                    "text": [
                                        "api call success"
                                    ]
                                },
                                "platform": "SKYPE"
                            }
                        ]
                    });
                }).catch((err) => {
                    console.log("some error occured");
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