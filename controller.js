var helper = require('./helper');
var _ = require('lodash');
var converter = require('number-to-words');
tempOppstatus = "";

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
                                "Hi, I am Macy, your Grand Thornton sales buddy. I can help you in knowing about the opportunities."
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
                });
                break;
            case "DefaultWelcomeIntent-applyfilter":
                var oppStatus = req.body.queryResult.parameters.oppstatus;
                console.log("TYPE OS", typeof oppStatus);
                console.log("opp tstua", oppStatus);
                console.log("inside DefaultWelcomeIntent-applyfilter ans status is ", oppStatus);
                res.json({
                    "followupEventInput": {
                        "name": "filter-event",
                        "parameters": {
                            "oppstatus": oppStatus
                        },
                        "languageCode": "en-US"
                    }
                }).end();
                break;
            case 'gt.userquery':
                console.log("inside gt.userquery");
                var oppStatus = req.body.queryResult.parameters.oppstatus;
                tempOppstatus = oppStatus;
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
                console.log("TEMP OPPSTATUS", tempOppstatus);
                var oppStatus = tempOppstatus;
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
                        filterRange = "Showing " + oppStatus + " opportunities between " + helper.dateISOToStandardForm(params.startDate) + " to " + helper.dateISOToStandardForm(params.endDate);
                    } else {
                        console.log(`ST , END Type ${typeof req.body.queryResult.parameters.startDate}, ${typeof req.body.queryResult.parameters.endDate}`);
                        if (req.body.queryResult.parameters.startDate != "" && req.body.queryResult.parameters.endDate != "") {
                            console.log("START DATE END DATE given")
                            params.startDate = req.body.queryResult.parameters.startDate;
                            params.endDate = req.body.queryResult.parameters.endDate;
                            filterRange = "Showing " + oppStatus + " opportunities between " + helper.dateISOToStandardForm(params.startDate) + " to " + helper.dateISOToStandardForm(params.endDate);
                        } else if (req.body.queryResult.parameters.condition != "") {
                            filterRange = `Showing ${oppStatus} opportunities for ${req.body.queryResult.parameters.condition}`;
                        }
                    }

                    if ((params.startDate !== "" && typeof params.startDate !== "undefined") && (params.endDate !== "" && typeof params.endDate !== "undefined")) {
                        params.condition = 'inBetween';
                        filterRange = "Showing" + oppStatus + " opportunities between " + helper.dateISOToStandardForm(params.startDate) + " to " + helper.dateISOToStandardForm(params.endDate);
                    } else if (monthName !== "" && typeof monthName !== "undefined") {
                        params.monthName = monthName;
                        params.condition = 'month';
                        filterRange = "Showing " + oppStatus + " opportunities for the month of " + monthName;
                    } else if (quarterly.length != "" && typeof quarterly !== "undefined") {
                        params.quaterType = quarterly;
                        params.condition = 'quarterly';
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
                        filterRange = "Showing " + oppStatus + " opportunities for " + quarterString;
                    }
                } else {
                    params.date = date;
                    filterRange = `Showing ${oppStatus} opportunities for the date ${helper.dateISOToStandardForm(date)}`;
                }
                console.log("PARAMS", JSON.stringify(params));
                return helper.callDynamicsAPI(params, filterRange).then((result) => {
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
                console.log("TEMP OPPSTATUS", tempOppstatus);
                var oppStatus = tempOppstatus;
                _.forEach(req.body.queryResult.outputContexts, function (value, key) {
                    if (_.includes(value.name, 'selected_status')) {
                        parameters = value.parameters;
                    }
                });
                console.log("Parameters", JSON.stringify(parameters));
                var revenuerange = req.body.queryResult.parameters.ranges;
                var number = req.body.queryResult.parameters.number;

                if (revenuerange != "") {
                    var rangeToWord;
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
                    filterRange = "Showing " + oppStatus + " opportunities with revenue " + rangeToWord + " " + number;
                } else {
                    console.log("low high defined");
                    params.low = low;
                    params.high = high;
                    filterRange = "Showing  " + oppStatus + " opportunities with revenue between " + parameters.low + " to " + parameters.high;
                }
                return helper.callDynamicsAPI(parameters, filterRange).then((result) => {
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
                        filterRange = "Showing " + oppStatus + " opportunities between " + helper.dateISOToStandardForm(params.startDate) + " to " + helper.dateISOToStandardForm(params.endDate);
                    } else {
                        console.log(`ST , END Type ${typeof req.body.queryResult.parameters.startDate}, ${typeof req.body.queryResult.parameters.endDate}`);
                        if (req.body.queryResult.parameters.startDate != "" && req.body.queryResult.parameters.endDate != "") {
                            console.log("START DATE END DATE given")
                            params.startDate = req.body.queryResult.parameters.startDate;
                            params.endDate = req.body.queryResult.parameters.endDate;
                            filterRange = "Showing " + oppStatus + " opportunities between " + helper.dateISOToStandardForm(params.startDate) + " to " + helper.dateISOToStandardForm(params.endDate);
                        } else if (req.body.queryResult.parameters.condition != "") {
                            filterRange = `Showing ${oppStatus} opportunities for ${req.body.queryResult.parameters.condition}`;
                        }
                    }

                    if ((params.startDate !== "" && typeof params.startDate !== "undefined") && (params.endDate !== "" && typeof params.endDate !== "undefined")) {
                        params.condition = 'inBetween';
                        filterRange = "Showing" + oppStatus + " opportunities between " + helper.dateISOToStandardForm(params.startDate) + " to " + helper.dateISOToStandardForm(params.endDate);
                    } else if (monthName !== "" && typeof monthName !== "undefined") {
                        params.monthName = monthName;
                        params.condition = 'month';
                        filterRange = "Showing " + oppStatus + " opportunities for the month of " + monthName;
                    } else if (quarterly.length != "" && typeof quarterly !== "undefined") {
                        params.quaterType = quarterly;
                        params.condition = 'quarterly';
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
                        filterRange = "Showing " + oppStatus + " opportunities for " + quarterString;
                    }
                } else {
                    params.date = date;
                    filterRange = `Showing ${oppStatus} opportunities for the date ${helper.dateISOToStandardForm(date)}`;
                }
                console.log("PARAMS", JSON.stringify(params));
                return helper.callDynamicsAPI(params, filterRange).then((result) => {
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
                    filterRange = "Showing " + oppStatus + " opportunities with revenue between " + low + " to " + high;
                } else {
                    console.log("range defined");
                    params.number = number;
                    params.ranges = revenuerange;
                    var rangeToWord;
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
                    filterRange = "Showing " + oppStatus + " opportunities with revenue " + rangeToWord + " " + number;
                }
                console.log("PARAMS", JSON.stringify(params));
                return helper.callDynamicsAPI(params, filterRange).then((result) => {
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
            case "gt.combinedRevenueIntent-yes":
                console.log("inside gt.combinedRevenueIntent-yes-supplyStatus");
                res.json({
                    "fulfillmentMessages": [{
                        "text": {
                            "text": [
                                "I can help you in knowing about the opportunities."
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
                });
                break;
            case "gt.combinedRevenueIntent-yes-supplyStatus":
                var oppStatus = req.body.queryResult.parameters.oppstatus;
                console.log("TYPE OS", typeof oppStatus);
                console.log("opp tstua", oppStatus);
                var textQuery = `show ${oppStatus} opportunities`;
                return helper.queryDialogflow(textQuery).then((result) => {
                    //console.log('result', JSON.parse(result).header);
                    console.log("RES", JSON.stringify(result));
                    var response = result.queryResult.fulfillmentMessages;
                    res.json({ response });
                }).catch((err) => {
                    console.log("some error occured", err);
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
