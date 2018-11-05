var request = require('request');

var self = {
    "callDynamicsAPI": function (params) {
        console.log('inside callDynamicsAPI');
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'POST',
                url: 'http://ec2-18-232-207-49.compute-1.amazonaws.com:7500/opportunities',
                headers: {
                    'content-type': 'application/json'
                },
                body: params,
                json: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log("callDynamicsAPI err", error);
                    reject("Something went wrong when processing your request. Please try again.");
                }
                var skypeResponse = self.prepareOpportunityCards(body);
                resolve(skypeResponse);
            });
        });
    },
    "prepareOpportunityCards": function (result) {
        console.log("callDynamicsAPI result body value", JSON.stringify(result.value));
        var response = {
            "fulfillmentMessages": []
        };
        if (typeof result.value !== 'undefined') {
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
        return response;
    }
};

module.exports = self;