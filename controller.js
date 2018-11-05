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
                    // console.log(req.data);
                    var condition = req.slots.condition.resolutions;
                    console.log(condition);
                    if (condition.length === 0 || typeof condition === "undefined") {
                        console.log("condition not provided");
                        startDate = req.data.request.intent.slots.startDate.value;
                        endDate = req.data.request.intent.slots.startDate.value;
                        monthName = req.data.request.intent.slots.monthName.value;
                        quarterly = req.slots.quarterly.resolutions;

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
                    } else {
                        console.log("condition provided")
                        var params = {
                            "condition": condition[0].values[0].name,
                            "oppstatus": oppStatus,
                            "filters": 'createdon'
                        };
                        filterRange = "for " + condition[0].values[0].name;
                    }

                } else {
                    var params = {
                        "date": date,
                        "oppstatus": oppStatus,
                        "filters": 'createdon'
                    };
                    filterRange = "on " + date;
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
