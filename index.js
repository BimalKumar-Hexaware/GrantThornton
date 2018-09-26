var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 5000;

app.post('/api/webhook', (req, res) => {
    console.log("Dialogflow request body", JSON.stringify(req.body));
    res.JSON({
        "text": {
            "text": [
                "hi this is skype welcome"
            ]
        },
        "platform": "SKYPE"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});