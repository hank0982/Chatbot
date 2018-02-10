//TOKEN

const sendTextMessage = (senderId, text) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: { text },
        }
    });
}
module.exports = (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.postback) {
                    if (event.postback.payload === 'GET_STARTED_PAYLOAD') {
                        let fake_event = {
                            type: 'getStart',
                            sender: {
                                id: event.sender.id
                            },
                            message: {
                                text: 'get started'
                            }
                        };
                        processMessage(fake_event);
                    } else if (event.postback.payload.substring(0, 4) === 'ACCE') {
                        console.log(event.postback.payload);
                        let ID = event.postback.payload.slice(4);
                        let fake_event = {
                            type: 'ACCE',
                            sender: {
                                id: event.sender.id
                            },
                            witoutapiai: true,
                            acceptID: ID
                        }
                        processMessage(fake_event);
                    } else if (event.postback.payload.substring(0, 4) === 'UNAC') {
                        let ID = event.postback.payload.slice(4);
                        let fake_event = {
                            type: 'UNAC',
                            sender: {
                                id: event.sender.id
                            },
                            witoutapiai: true,
                            unacceptID: ID
                        }
                        processMessage(fake_event);
                    } else if (event.postback.payload.substring(0, 5) === 'PAYIT') {
                        let ID = event.postback.payload.slice(5);
                        let fake_event = {
                            type: 'PAY',
                            sender: {
                                id: event.sender.id
                            },
                            witoutapiai: true,
                            receiveId: ID
                        }
                        processMessage(fake_event);
                    } else if (event.postback) {
                        let fake_event = {
                            type: 'select',
                            witoutapiai: true,
                            sender: {
                                id: event.sender.id
                            },
                            selectKey: event.postback.payload
                        };
                        processMessage(fake_event);
                    }
                } else if (event.message && (event.message.text || event.message.attachments) && event.sender.id != FEEDME_ID) {
                    if (event.message.attachments) {
                        if (event.message.attachments[0].type == 'location') {
                            let coordinates = event.message.attachments[0].payload.coordinates;
                            var lat = coordinates.lat;
                            var lng = coordinates.long;
                            let google_url = GOOGLE_MAP_API + 'latlng=' + lat + ',' + lng + '&key=' + GOOGLE_KEY;
                            request({
                                uri: google_url,
                                methos: 'GET',
                            }, (err, response, body) => {
                                const jsonbody = JSON.parse(body)
                                let first_address = jsonbody.results[0].formatted_address;
                                let fake_event = {
                                    type: 'location',
                                    sender: {
                                        id: event.sender.id
                                    },
                                    witoutapiai: true,
                                    address: first_address,
                                    lat: event.message.attachments[0].payload.coordinates.lat,
                                    lng: event.message.attachments[0].payload.coordinates.long
                                }
                                processMessage(fake_event);
                            })
                        } else if (event.message.attachments[0].type == 'image') {
                            console.log(event.message.attachments[0]);
                            let imgurl = event.message.attachments[0].payload.url;
                            let fake_event = {
                                type: 'image',
                                sender: {
                                    id: event.sender.id
                                },
                                witoutapiai: true,
                                imgurl: imgurl
                            }
                            processMessage(fake_event);
                        }
                    } else if (event.message.text) {
                        processMessage(event);
                    }
                }
            });
        });

        res.status(200).end();
    }
};
