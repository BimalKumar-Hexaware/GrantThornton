var helper = require('./helper');
var _ = require('lodash');
var converter = require('number-to-words');

module.exports = {
    "webhookRequestHandler": (req, res) => {
        console.log("Dialogflow request body", JSON.stringify(req.body));
        console.log("DF Action", req.body.queryResult.action);
        var parameters = {};
        switch (req.body.queryResult.action) {
            case "gt.userquery-applyfilter-date-supplydate":
                _.forEach(req.body.queryResult.outputContexts, function (value, key) {
                    if (_.includes(value.name, 'selected_status')) {
                        parameters = value.parameters;
                    }
                });
                console.log("Parameters", parameters);
                return helper.callDynamicsAPI(parameters).then((result) => {
                    console.log("SKYPE RESPONSE", result);
                    res.json(result);
                }).catch((err) => {
                    console.log("ERROR", err);
                    res.json({
                        "text": {
                            "text": [
                                "Something went wrong when processing your request. Please try again."
                            ]
                        },
                        "platform": "SKYPE"
                    });
                });
                break;
            case "gt.userquery-applyfilter-revenue-ranges":
                _.forEach(req.body.queryResult.outputContexts, function (value, key) {
                    if (_.includes(value.name, 'selected_status')) {
                        parameters = value.parameters;
                    }
                });
                console.log("Parameters", parameters);
                return helper.callDynamicsAPI(parameters).then((result) => {
                    console.log("SKYPE RESPONSE", result);
                    res.json(result);
                }).catch((err) => {
                    console.log("ERROR", err);
                    res.json({
                        "text": {
                            "text": [
                                "Something went wrong when processing your request. Please try again."
                            ]
                        },
                        "platform": "SKYPE"
                    });
                });
                break;
            case "gt.combinedDateIntent":
                var date = req.body.queryResult.parameters.date;
                var oppStatus = req.body.queryResult.parameters.oppstatus;
                console.log("Date", date);
                if (date == "" || typeof date == "undefined") {
                    console.log("date not provided");
                    monthName = req.body.queryResult.parameters.monthname;
                    console.log("MONTH TYPE", typeof monthName);
                    if (typeof monthName == 'object') {
                        startDate = monthName.startDate;
                        endDate = monthName.endDate;
                    } else {
                        startDate = req.body.queryResult.parameters.startDate;
                        endDate = req.body.queryResult.parameters.endDate;
                    }
                    quarterly = req.body.queryResult.parameters.quarterly;

                    if ((startDate !== "" && typeof startDate !== "undefined") && (endDate !== "" && typeof endDate !== "undefined")) {
                        var params = {
                            "startDate": startDate,
                            "endDate": endDate,
                            "condition": 'inBetween',
                            "oppstatus": oppStatus,
                            "filters": 'createdon'
                        };
                        filterRange = "between" + startDate + " to " + endDate;
                    } else if (monthName !== "" && typeof monthName !== "undefined") {
                        var params = {
                            "monthName": monthName,
                            "condition": 'month',
                            "oppstatus": oppStatus,
                            "filters": 'createdon'
                        };
                        filterRange = "for the month of " + monthName;
                    } else if (quarterly.length !== 0 && typeof quarterly !== "undefined") {
                        var params = {
                            "quaterType": quarterly,
                            "condition": 'quarterly',
                            "oppstatus": oppStatus,
                            "filters": 'createdon'
                        };
                        filterRange = "for the quarter " + quarterly;
                    }
                } else {
                    var params = {
                        "date": date,
                        "oppstatus": oppStatus,
                        "filters": 'createdon'
                    };
                    //filterRange = "for the date " + quarterly;
                    filterRange = "for the date ";
                }
                console.log("PARAMS", params);
                return helper.callDynamicsAPI(parameters).then((result) => {
                    console.log("SKYPE RESPONSE", result);
                    res.json(result);
                }).catch((err) => {
                    console.log("ERROR", err);
                    res.json({
                        "text": {
                            "text": [
                                "Something went wrong when processing your request. Please try again."
                            ]
                        },
                        "platform": "SKYPE"
                    });
                });
                break;
            case "gt.combinedRevenueIntent":
                var oppStatus = req.body.queryResult.parameters.oppstatus;
                var number = req.body.queryResult.parameters.number;
                var revenuerange = req.body.queryResult.parameters.revenuerange;
                var filterRange = '';
                if (revenuerange == "" || typeof revenuerange == "undefined") {
                    high = req.body.queryResult.parameters.high;
                    low = req.body.queryResult.parameters.low;
                    console.log("low high defined");
                    var params = {
                        "high": high,
                        "low": low,
                        "oppstatus": oppStatus,
                        "filters": 'estimatedvalue'
                    };
                    //filterRange = "with Revenue between " + converter.toWords(low) + " to " + converter.toWords(high);
                    filterRange = "";
                } else {
                    console.log("range defined");
                    var params = {
                        "number": number,
                        "oppstatus": oppStatus,
                        "filters": 'estimatedvalue'
                    };
                    switch (revenuerange) {
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
                    }
                    //filterRange = "with Revenue " + revenuerange + converter.toWords(number);
                    filterRange = "";
                }
                console.log("PARAMS", params);
                return helper.callDynamicsAPI(parameters).then((result) => {
                    console.log("SKYPE RESPONSE", result);
                    res.json(result);
                }).catch((err) => {
                    console.log("ERROR", err);
                    res.json({
                        "text": {
                            "text": [
                                "Something went wrong when processing your request. Please try again."
                            ]
                        },
                        "platform": "SKYPE"
                    });
                });
                break;
        }
    }
};
