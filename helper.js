var request = require('request');
var _ = require('lodash');
var key = require('./grantthornton-f364a-6801e0b5dd81.json');
const googleAuth = require('google-oauth-jwt');
let { google } = require('googleapis');
var async = require('async');
var millify = require('millify');

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
                                "subtitle": "Revenue: $" + millify(value.estimatedvalue)
                            },
                            "platform": "SKYPE"
                        });
                    }
                });
            } else {
                response.fulfillmentMessages.push({
                    "text": {
                        "text": [
                            "There is no matching opportunities found for your request.Is there anything else that I can help you with?"
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
    "mainMenuPayload": function (fromWelcomeIntent) {
        var openingMessage = (fromWelcomeIntent) ? "Hi, I am Macy, your Grand Thornton sales buddy. I can help you in knowing about the opportunities." : "I can help you in knowing about the opportunities.";
        var payload = {
            "fulfillmentMessages": [{
                "text": {
                    "text": [
                        openingMessage
                    ]
                },
                "platform": "SKYPE"
            }, {
                "card": {
                    "title": "What opportunity would you like to see?",
                    "buttons": [
                        {
                            "text": "Open",
                            "postback": "open"
                        },
                        {
                            "text": "Closed",
                            "postback": "closed"
                        },
                        {
                            "text": "Won",
                            "postback": "won"
                        },
                        {
                            "text": "Lost",
                            "postback": "lost"
                        },
                        {
                            "text": "All",
                            "postback": "all"
                        }
                    ]
                },
                "platform": "SKYPE"
            }]
        };
        return payload;
    },
    "opportunityStatusMenu": function () {
        var payload = {
            "fulfillmentMessages": [{
                "card": {
                    "title": "What opportunity would you like to see?",
                    "buttons": [
                        {
                            "text": "Open",
                            "postback": "open"
                        },
                        {
                            "text": "Closed",
                            "postback": "closed"
                        },
                        {
                            "text": "Won",
                            "postback": "won"
                        },
                        {
                            "text": "Lost",
                            "postback": "lost"
                        },
                        {
                            "text": "All",
                            "postback": "all"
                        }
                    ]
                },
                "platform": "SKYPE"
            }]
        };
        return payload;
    },
    "filterPayload": function () {
        var payload = {
            "fulfillmentMessages": [
                {
                    "card": {
                        "title": "Would you like to see it based on",
                        "buttons": [
                            {
                                "text": "Estimated Revenue",
                                "postback": "revenue"
                            },
                            {
                                "text": "Created Date",
                                "postback": "date"
                            }
                        ]
                    },
                    "platform": "SKYPE"
                }
            ]
        };
        return payload;
    },
    "queryDialogflow": function (textQuery, sessionId) {
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
                        url: 'https://dialogflow.googleapis.com/v2/projects/grantthornton-f364a/agent/sessions/' + sessionId + ':detectIntent',
                        headers:
                        {
                            'content-type': 'application/json',
                            authorization: tokenData
                        },
                        body: { query_input: { text: { text: textQuery, language_code: 'en-US' } } },
                        json: true
                    };
                    console.log("OPTIONS", options);
                    request(options, function (error, response, body) {
                        if (error) {
                            console.log("ERROR", error);
                            reject("Event request error", error);
                        }
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
    },
    "handleDateIntent": function (req) {
        var params = {};
        var filterRange = "";
        var date = req.body.queryResult.parameters.date;
        var oppStatus = req.body.queryResult.parameters.oppstatus;
        var quarterly = req.body.queryResult.parameters.quarterly;
        var monthName = req.body.queryResult.parameters.monthname;
        var condition = req.body.queryResult.parameters.condition;
        _.forEach(req.body.queryResult.outputContexts, function (value, key) {
            if (_.includes(value.name, 'selected_status')) {
                params = value.parameters;
            }
        });
        console.log("Date", date);
        if (date == "" || typeof date == "undefined") {
            console.log("date not provided");
            console.log("MONTH TYPE", typeof monthName);
            if (typeof monthName == 'object') {
                params.startDate = monthName.startDate;
                params.endDate = monthName.endDate;
                filterRange = `Showing ${oppStatus} opportunities between ${helper.dateISOToStandardForm(params.startDate)} to ${helper.dateISOToStandardForm(params.endDate)}.`;
            } else {
                console.log(`ST , END Type ${typeof req.body.queryResult.parameters.startDate}, ${typeof req.body.queryResult.parameters.endDate}`);
                if (req.body.queryResult.parameters.startDate != "" && req.body.queryResult.parameters.endDate != "") {
                    console.log("START DATE END DATE given")
                    params.startDate = req.body.queryResult.parameters.startDate;
                    params.endDate = req.body.queryResult.parameters.endDate;
                    filterRange = `Showing ${oppStatus} opportunities between ${helper.dateISOToStandardForm(params.startDate)} to ${helper.dateISOToStandardForm(params.endDate)}.`;
                } else if (condition != "") {
                    var dateCondition = condition;
                    filterRange = `Showing ${oppStatus} opportunities for ${dateCondition.replace("-", " ")}`;
                }
            }
            if ((params.startDate !== "" && typeof params.startDate !== "undefined") && (params.endDate !== "" && typeof params.endDate !== "undefined")) {
                params.condition = 'inBetween';
                filterRange = `Showing ${oppStatus} opportunities between ${helper.dateISOToStandardForm(params.startDate)} to ${helper.dateISOToStandardForm(params.endDate)}.`;
            } else if (monthName !== "" && typeof monthName !== "undefined") {
                params.monthName = monthName;
                params.condition = 'month';
                filterRange = `Showing ${oppStatus} opportunities for the month of ${monthName}`;
            } else if (quarterly.length != "" && typeof quarterly !== "undefined") {
                params.quaterType = quarterly;
                params.condition = 'quarterly';
                var quarterString = self.getQuarterString(quarterly);
                filterRange = `Showing ${oppStatus} opportunities for ${quarterString}`;
            }
        } else {
            params.date = date;
            filterRange = `Showing ${oppStatus} opportunities for the date ${helper.dateISOToStandardForm(date)}`;
        }
    },
    "getQuarterString": function (quarterly) {
        var quarterString = "";
        switch (quarterly) {
            case "Q1":
                quarterString = "first quarter";
                break;
            case "Q2":
                quarterString = "second quarter";
                break;
            case "Q3":
                quarterString = "third quarter";
                break;
            case "Q4":
                quarterString = "last quarter";
                break;
        }
        return quarterString;
    },
    "handleRevenueIntent": function () {
        var params = {};
        var filterRange = '';
        var oppStatus = req.body.queryResult.parameters.oppstatus;
        var number = req.body.queryResult.parameters.number;
        var revenuerange = req.body.queryResult.parameters.ranges;
        var high = req.body.queryResult.parameters.high;
        var low = req.body.queryResult.parameters.low;        
        _.forEach(req.body.queryResult.outputContexts, function (value, key) {
            if (_.includes(value.name, 'selected_status')) {
                params = value.parameters;
            }
        });
        if (revenuerange == "" || typeof revenuerange == "undefined") {
            console.log("low high defined");
            params.low = low;
            params.high = high;
            filterRange = `Showing ${oppStatus} opportunities with revenue between $${millify(low)} to $${millify(high)}`;
        } else {
            console.log("range defined");
            params.number = number;
            params.ranges = revenuerange;
            var rangeToWord = self.revenueRangeToWord(revenuerange);
            filterRange = `Showing ${oppStatus} opportunities with revenue ${rangeToWord} $${millify(number)}`;
        }
    },
    "revenueRangeToWord": function (revenuerange) {
        var rangeToWord = "";
        switch (revenuerange) {
            case 'eq':
                rangeToWord = "equals";
                break;
            case 'ne':
                rangeToWord = "not equal";
                break;
            case 'le':
                rangeToWord = "less than or equal";
                break;
            case 'lt':
                rangeToWord = "less than";
                break;
            case 'gt':
                rangeToWord = "greater than";
                break;
            case 'ge':
                rangeToWord = "greater than or equal";
                break;
        }
        return rangeToWord;
    }
};

module.exports = self;