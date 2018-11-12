var request = require('request');
var _ = require('lodash');
var key = require('./grantthornton-f364a-6801e0b5dd81.json');
const googleAuth = require('google-oauth-jwt');
let { google } = require('googleapis');
var async = require('async');

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
        response.fulfillmentMessages.push({
            "text": {
                "text": [
                    filterRange
                ]
            },
            "platform": "SKYPE"
        });
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
    },
    "dateISOToStandardForm": function (dateString) {
        date = new Date(dateString);
        formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        return formattedDate;
    },
    "queryDialogflow": function (textQuery) {
        return new Promise(function (resolve, reject) {
            async.waterfall([
                function (cb) {
                    let jwtClient = new google.auth.JWT(
                        key.client_email,
                        null,
                        key.private_key,
                        ['https://www.googleapis.com/auth/cloud-platform']

                    );
                    jwtClient.authorize(function (err, tokens) {
                        if (err) {
                            console.log('error', err);
                            reject(err);
                        } else {
                            console.log("tokens", tokens);
                            tokenData = tokens.token_type + ' ' + tokens.access_token;
                            console.log("token data", tokenData);
                            cb(null, tokenData);
                        }
                    });
                },
                function (tokenData) {
                    console.log("passed tokrn", tokenData);
                    var options = {
                        method: 'POST',
                        url: 'https://dialogflow.googleapis.com/v2/projects/grantthornton-f364a/agent/sessions/123456789:detectIntent',
                        headers:
                        {
                            'content-type': 'application/json',
                            authorization: tokenData
                        },
                        body: { query_input: { text: { text: textQuery, language_code: 'en-US' } } },
                        json: true
                    };
                    request(options, function (error, response, body) {
                        if (error) {
                            console.log("ERROR", error);
                            reject("Event request error", error);
                        }
                        console.log("BODY", body);
                        resolve(body);
                    });
                }
            ], function (error) {
                if (error) {
                    console.log("ERROR: ", error);
                    reject("Something went wrong!");
                }
            });
        });
    }
};

module.exports = self;