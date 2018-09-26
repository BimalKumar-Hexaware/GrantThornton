var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;

app.post('/api/webhook', (req, res) => {
    console.log("Dialogflow request body", JSON.stringify(req.body));
    res.json({
        "messages": [
            {
                "speech": "Text response",
                "type": 0
            }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});