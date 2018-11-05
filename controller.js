var helper = require('./helper');
var _ = require('lodash');
module.exports = {
    "webhookRequestHandler": (req, res) => {
        console.log("Dialogflow request body", JSON.stringify(req.body));
        console.log("DF Action", req.body.queryResult.action);
        var parameters = {};

        switch (req.body.queryResult.action) {
            case "gt.getoppsbystatus":
                var oppstatus = req.body.queryResult.parameters.oppstatus;
                console.log("oppstatus", oppstatus);
                res.json({
                    "followupEventInput": {
                        "name": "filter-event",
                        "parameters": {
                            "oppstatus": oppstatus,
                        },
                        "languageCode": "en-US"
                    }
                });
                break;
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
                console.log("Date", date);
                if (date == "" || typeof date == "undefined") {
                    console.log("date not provided");
                    startDate = req.body.queryResult.parameters.date;
                    endDate = req.body.queryResult.parameters.endDate;
                    monthName = req.body.queryResult.parameters.monthname;
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
                            "quaterType": quarterly[0].values[0].name,
                            "condition": 'quarterly',
                            "oppstatus": oppStatus,
                            "filters": 'createdon'
                        };
                        filterRange = "for the quarter " + quarterly[0].values[0].name;
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
    }
};
