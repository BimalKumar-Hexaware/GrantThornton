module.exports = {
    "webhookRequestHandler": (req, res) => {
        console.log("Dialogflow request body", JSON.stringify(req.body));
        console.log("DF Action", req.body.queryResult.action);
        switch (req.body.queryResult.action) {
            case "gt.userquery-applyfilter-filtercriteria":
                res.json({
                    "fulfillmentMessages": [
                        {
                            "text": {
                                "text": [
                                    "push to api"
                                ]
                            },
                            "platform": "SKYPE"
                        }
                    ]
                });
                break;
        }
    }
};