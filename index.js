var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;

app.post('/api/webhook', (req, res) => {
    console.log("Dialogflow request body", JSON.stringify(req.body));
    console.log("DF Action", req.body.queryResult.action);
    switch (req.body.queryResult.action) {
        case "input.welcome":
            res.json({
                "fulfillmentMessages": [
                    {
                        "text": {
                            "text": [
                                "this is a welcome message"
                            ]
                        },
                        "platform": "SKYPE"
                    }
                ]
            });
            break;
        case "testcards":
            res.json({
                "fulfillmentMessages": [
                    {
                        "card": {
                            "title": "Demo card title",
                            "subtitle": "card sub title",
                            "buttons": [
                                {
                                    "text": "First button",
                                    "postback": "first_payload"
                                },
                                {
                                    "text": "Second button",
                                    "postback": "second_payload"
                                }
                            ]
                        },
                        "platform": "SKYPE"
                    }
                ]
            });
            break;
        case "testquickreply":
            res.json({
                "fulfillmentMessages": [
                    {
                        "quickReplies": {
                            "title": "sdsds",
                            "quickReplies": [
                                "dd"
                            ]
                        },
                        "platform": "SKYPE"
                    },
                    {
                        "quickReplies": {
                            "title": "asasas",
                            "quickReplies": [
                                "sasas"
                            ]
                        },
                        "platform": "SKYPE"
                    }
                ]
            });
            break;
    }

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});