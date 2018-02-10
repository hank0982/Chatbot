const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const verificationController = require('./controllers/verification');
const messageWebhookController = require('./controllers/messageWebhook');
const imageSearchController = require('./controllers/imageSearch');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen((process.env.PORT || 5000), () => console.log('Webhook server is listening at port 5000'));

app.get('/webhook', verificationController);
app.post('/webhook', messageWebhookController);
app.post('/image-search', imageSearchController);
