var request = require('request');
var _ = require('lodash');

var self = {
    "callDynamicsAPI": function (params, filterRange) {
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
                console.log("Dynamics response body", JSON.stringify(body));
                var skypeResponse = self.prepareOpportunityCards(body, filterRange);
                resolve(skypeResponse);
            });
        });
    },
    "prepareOpportunityCards": function (result, filterRange) {
        var response = {
            "fulfillmentMessages": []
        };
        /*response.fulfillmentMessages.push({
            "text": {
                "text": [
                    "Showing opportunities " + filterRange
                ]
            },
            "platform": "SKYPE"
        });*/
        console.log("F RANGE", filterRange);
        if (typeof result.value == "undefined" || result.value == "") {
            response.fulfillmentMessages.push({
                "text": {
                    "text": [
                        "There is no matching opportunities found for your request."
                    ]
                },
                "platform": "SKYPE"
            });
        } else {
            if (typeof result.value !== 'undefined') {
                _.forEach(result.value, function (value, key) {
                    if (key < 5) {
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
                            "There is no matching opportunities found for your request."
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
        }

        console.log("response", response);
        return response;
    },
    "newsUpdatesAPI": function (params) {
        console.log('inside newsUpdatesAPI');
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'POST',
                url: 'http://ec2-18-232-207-49.compute-1.amazonaws.com:7500/twitterFeed',
                headers: {
                    'content-type': 'application/json'
                },
                body: params,
                json: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log("newsUpdatesAPI err", error);
                    reject("Something went wrong when processing your request. Please try again.");
                }
                resolve(body);
            });
        });
    }
};

module.exports = self;