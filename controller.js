var helper = require('./helper');
var _ = require('lodash');
var converter = require('number-to-words');

module.exports = {
    "webhookRequestHandler": (req, res) => {
        console.log("Dialogflow request body", JSON.stringify(req.body));
        console.log("DF Action", req.body.queryResult.action);
        var params = {};
        switch (req.body.queryResult.action) {
            case "input.welcome":
                res.json({
                    "fulfillmentMessages": [{
                        "text": {
                            "text": [
                                "Hi, I am Macy. Your Grand Thornton sales buddy. I can help you in knowing about the opportunities."
                            ]
                        },
                        "platform": "SKYPE"
                    }, {
                        "card": {
                            "title": "Tell me what opportunity would you like to see?",
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
                                    "text": "All",
                                    "postback": "all"
                                },
                                {
                                    "text": "Won",
                                    "postback": "won"
                                },
                                {
                                    "text": "Lost",
                                    "postback": "lost"
                                }
                            ]
                        },
                        "platform": "SKYPE"
                    }]
                });
                break;
            case "DefaultWelcomeIntent-applyfilter":
                var oppStatus = req.body.queryResult.parameters.oppstatus;
                console.log("inside DefaultWelcomeIntent-applyfilter ans status is ", oppStatus);
                var test = `show me ${oppStatus} opportunities`;
                res.json({
                    "followupEventInput": {
                        "name": test,
                        "languageCode": "en-US"
                    }
                });
                break;
            case 'gt.userquery':
                console.log("inside gt.userquery");
                var oppStatus = req.body.queryResult.parameters.oppstatus;
                if (oppStatus == "") {
                    console.log("status not provided");
                    res.json({
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
                                        "text": "All",
                                        "postback": "all"
                                    },
                                    {
                                        "text": "Won",
                                        "postback": "won"
                                    },
                                    {
                                        "text": "Lost",
                                        "postback": "lost"
                                    }
                                ]
                            },
                            "platform": "SKYPE"
                        }]
                    });
                } else {
                    console.log("status provided");
                    res.json({
                        "followupEventInput": {
                            "name": "filter-event",
                            "parameters": {
                                "oppstatus": oppStatus
                            },
                            "languageCode": "en-US"
                        }
                    });
                }
                break;
            case "gt.userquery-applyfilter-date-supplydate":
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
                console.log("Parameters", JSON.stringify(params));
                if (date == "" || typeof date == "undefined") {
                    console.log("date not provided");
                    console.log("MONTH TYPE", typeof monthName);
                    if (typeof monthName == 'object') {
                        params.startDate = monthName.startDate;
                        params.endDate = monthName.endDate;
                    } else {
                        if (typeof req.body.queryResult.parameters.startDate != "undefined" && typeof req.body.queryResult.parameters.endDate != "undefined") {
                            params.startDate = req.body.queryResult.parameters.startDate;
                            params.endDate = req.body.queryResult.parameters.endDate;
                        }
                    }

                    if ((params.startDate !== "" && typeof params.startDate !== "undefined") && (params.endDate !== "" && typeof params.endDate !== "undefined")) {
                        params.condition = 'inBetween';
                        filterRange = "between" + startDate + " to " + endDate;
                    } else if (monthName !== "" && typeof monthName !== "undefined") {
                        params.monthName = monthName;
                        params.condition = 'month';
                        filterRange = "for the month of " + monthName;
                    } else if (quarterly.length !== 0 && typeof quarterly !== "undefined") {
                        params.quaterType = quarterly;
                        params.condition = 'quarterly';
                        filterRange = "for the quarter " + quarterly;
                    }
                } else {
                    params.date = date;
                    //filterRange = "for the date " + quarterly;
                    filterRange = "for the date ";
                }
                console.log("PARAMS", JSON.stringify(params));
                return helper.callDynamicsAPI(params).then((result) => {
                    console.log("SKYPE RESPONSE", result);
                    res.json(result);
                }).catch((err) => {
                    console.log("ERROR", err);
                    res.json({
                        "fulfillmentMessages": [{
                            "text": {
                                "text": [
                                    "Something went wrong when processing your request. Please try again."
                                ]
                            },
                            "platform": "SKYPE"
                        }]
                    });
                });
                break;
            case "gt.userquery-applyfilter-revenue-ranges":
                _.forEach(req.body.queryResult.outputContexts, function (value, key) {
                    if (_.includes(value.name, 'selected_status')) {
                        parameters = value.parameters;
                    }
                });
                console.log("Parameters", JSON.stringify(parameters));
                return helper.callDynamicsAPI(parameters).then((result) => {
                    console.log("SKYPE RESPONSE", result);
                    res.json(result);
                }).catch((err) => {
                    console.log("ERROR", err);
                    res.json({
                        "fulfillmentMessages": [{
                            "text": {
                                "text": [
                                    "Something went wrong when processing your request. Please try again."
                                ]
                            },
                            "platform": "SKYPE"
                        }]
                    });
                });
                break;
            case "gt.combinedDateIntent":
                var date = req.body.queryResult.parameters.date;
                var oppStatus = req.body.queryResult.parameters.oppstatus;
                var quarterly = req.body.queryResult.parameters.quarterly;
                var monthName = req.body.queryResult.parameters.monthname;
                var condition = req.body.queryResult.parameters.condition;
                var params = {
                    "startDate": "",
                    "endDate": "",
                    "condition": condition,
                    "oppstatus": oppStatus,
                    "filters": 'createdon',
                    "monthName": "",
                    "quaterType": "",
                    "date": ""
                };
                console.log("Date", date);
                if (date == "" || typeof date == "undefined") {
                    console.log("date not provided");
                    console.log("MONTH TYPE", typeof monthName);
                    if (typeof monthName == 'object') {
                        params.startDate = monthName.startDate;
                        params.endDate = monthName.endDate;
                    } else {
                        if (typeof req.body.queryResult.parameters.startDate != "undefined" && typeof req.body.queryResult.parameters.endDate != "undefined") {
                            params.startDate = req.body.queryResult.parameters.startDate;
                            params.endDate = req.body.queryResult.parameters.endDate;
                        }
                    }

                    if ((params.startDate !== "" && typeof params.startDate !== "undefined") && (params.endDate !== "" && typeof params.endDate !== "undefined")) {
                        params.condition = 'inBetween';
                        filterRange = "between" + startDate + " to " + endDate;
                    } else if (monthName !== "" && typeof monthName !== "undefined") {
                        params.monthName = monthName;
                        params.condition = 'month';
                        filterRange = "for the month of " + monthName;
                    } else if (quarterly.length !== 0 && typeof quarterly !== "undefined") {
                        params.quaterType = quarterly;
                        params.condition = 'quarterly';
                        filterRange = "for the quarter " + quarterly;
                    }
                } else {
                    params.date = date;
                    //filterRange = "for the date " + quarterly;
                    filterRange = "for the date ";
                }
                console.log("PARAMS", JSON.stringify(params));
                return helper.callDynamicsAPI(params).then((result) => {
                    console.log("SKYPE RESPONSE", result);
                    res.json(result);
                }).catch((err) => {
                    console.log("ERROR", err);
                    res.json({
                        "fulfillmentMessages": [{
                            "text": {
                                "text": [
                                    "Something went wrong when processing your request. Please try again."
                                ]
                            },
                            "platform": "SKYPE"
                        }]
                    });
                });
                break;
            case "gt.combinedRevenueIntent":
                var oppStatus = req.body.queryResult.parameters.oppstatus;
                var number = req.body.queryResult.parameters.number;
                var revenuerange = req.body.queryResult.parameters.ranges;
                var high = req.body.queryResult.parameters.high;
                var low = req.body.queryResult.parameters.low;
                var filterRange = '';
                var params = {
                    "high": "",
                    "low": "",
                    "oppstatus": oppStatus,
                    "filters": 'estimatedvalue',
                    "number": "",
                    "ranges": ""
                };
                if (revenuerange == "" || typeof revenuerange == "undefined") {
                    console.log("low high defined");
                    params.low = low;
                    params.high = high;
                    //filterRange = "with Revenue between " + converter.toWords(low) + " to " + converter.toWords(high);
                    filterRange = "";
                } else {
                    console.log("range defined");
                    params.number = number;
                    params.ranges = revenuerange;
                    /*switch (revenuerange) {
                        case 'equals':
                            params.ranges = "eq";
                            break;
                        case 'not equal':
                            params.ranges = "ne";
                            break;
                        case 'less than or equal':
                            params.ranges = "le";
                            break;
                        case 'less than':
                            params.ranges = "lt";
                            break;
                        case 'greater than':
                            params.ranges = "gt";
                            break;
                        case 'greater than or equal':
                            params.ranges = "ge";
                            break;
                    }*/
                    //filterRange = "with Revenue " + revenuerange + converter.toWords(number);
                    filterRange = "";
                }
                console.log("PARAMS", JSON.stringify(params));
                return helper.callDynamicsAPI(params).then((result) => {
                    console.log("SKYPE RESPONSE", result);
                    res.json(result);
                }).catch((err) => {
                    console.log("ERROR", err);
                    res.json({
                        "fulfillmentMessages": [{
                            "text": {
                                "text": [
                                    "Something went wrong when processing your request. Please try again."
                                ]
                            },
                            "platform": "SKYPE"
                        }]
                    });
                });
                break;
            case "gt.newsUpdates":
                console.log("inside gt.newsUpdates");
                return helper.newsUpdatesAPI().then((result) => {
                    console.log("NEWSes", result);
                    var latestNews = `Here is the latest update from twitter: ${result[Math.floor(Math.random() * result.length)]}`;
                    console.log("Latest news", latestNews);
                    res.json({
                        "fulfillmentMessages": [{
                            "text": {
                                "text": [
                                    latestNews
                                ]
                            },
                            "platform": "SKYPE"
                        }]
                    });
                }).catch((err) => {
                    console.log("ERROR", err);
                    res.json({
                        "fulfillmentMessages": [{
                            "text": {
                                "text": [
                                    "Something went wrong when processing your request. Please try again."
                                ]
                            },
                            "platform": "SKYPE"
                        }]
                    });
                });
                break;
        }
    }
};
