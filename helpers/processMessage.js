const API_AI_TOKEN = '';
const FACEBOOK_ACCESS_TOKEN = '';
var rp = require('request-promise');

const request = require('request');

const apiAiClient = require('apiai')(API_AI_TOKEN);

var admin = require("firebase-admin");
var firebase = require('firebase');
var serviceAccount = require("./fred-cfeea-firebase-adminsdk-h7tcw-02b214e0a7.json");
var GeoFire = require('geofire');

firebase.initializeApp(config);
// Get a reference to the database service
var database = firebase.database();
var firebaseRef = firebase.database().ref();
var geoFire = new GeoFire(firebaseRef.child('userslocation'));
const sendBuyBotton = (senderId, imageUri) => {
    var timeStamp = new Date().getTime();
    return rp({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                attachment: {
                    type: 'image',
                    payload: { url: imageUri }
                }
            }
        }
    });
}
const sendImage = (senderId, imageUri) => {
    return rp({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                attachment: {
                    type: 'image',
                    payload: { url: imageUri }
                }
            }
        }
    });
}

const sendTextMessage = (senderId, text) => {
    return rp({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: { text },
        }
    });
}

const sendQuickLocation = (senderId) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                text: 'Please share your location:',
                quick_replies: [{
                    content_type: 'location'
                }]
            },
        }
    })
}

const sendGeneric = (senderId, elements) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'generic',
                        elements: elements
                    }
                }
            },
        }
    })
}

const sendQuickButtonCuisine = (senderId, text) => {
    var cuisine_array = ['Chinese', 'Indian', 'Vietnamese', 'Mexican', 'Greek', 'brazilian', 'british', 'brasseries', 'burmese', 'cajun', 'cambodian'];
    var item1 = cuisine_array[Math.floor(Math.random() * cuisine_array.length)];
    do {
        var item2 = cuisine_array[Math.floor(Math.random() * cuisine_array.length)];
    } while (item1 === item2)
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                text: text,
                quick_replies: [{
                    content_type: 'text',
                    title: item1,
                    payload: item1
                }, {
                    content_type: 'text',
                    title: item2,
                    payload: item2
                }]
            },
        }
    });
}
const sendButton = (senderId, text, buttons) => {
    return rp({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'button',
                        text: text,
                        buttons: buttons
                    }
                }
            },
        }
    });
}
const sendQuickButtonYES_NO = (senderId, text) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                text: text,
                quick_replies: [{
                    content_type: 'text',
                    title: 'Yes',
                    payload: 'YES'
                }, {
                    content_type: 'text',
                    title: 'No',
                    payload: 'NO'
                }]
            },
        }
    });
}

const sendQuickButtonCook_Feed = (senderId, text) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                text: text,
                quick_replies: [{
                    content_type: 'text',
                    title: "cooking for 2 people",
                    payload: "cooking for 2 people"
                }, {
                    content_type: 'text',
                    title: "Feed me !!",
                    payload: 'Feed me'
                }]
            },
        }
    });
}

function register(senderId, imageUri) {
    let url = 'https://graph.facebook.com/v2.6/' + senderId + '?access_token=' + FACEBOOK_ACCESS_TOKEN;
    request(url, (error, response, body) => {
        const fbResponse = JSON.parse(body)
        if (!error && response.statusCode === 200) {
            database.ref("/users").child(senderId).once("value", function(r) {
                    if (r.val() == null) {
                        database.ref().child("users").child(senderId).set({
                            firstname: fbResponse.first_name,
                            lastname: fbResponse.last_name,
                            gender: fbResponse.gender
                        }).then(function() {
                            sendImage(senderId, imageUri).then(function(r) {
                                let text = fbResponse.first_name + ', Nice to meet you! Thank you for using our service';
                                sendTextMessage(senderId, 'Thank you! The app is still under development. You will be notified when we launch and keep you updated!');

                            });
                            return;
                        });
                    } else {
                        sendQuickButtonCook_Feed(senderId, 'Start right now!!');
                        console.log(r.val());
                        return;
                    }
                },
                function(err) {
                    console.log('err');
                });
            console.log("Got a response from: ", senderId, fbResponse);
        } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode)
        }
    });
}

function asy_array_loop(array, function_A, i, first_para) {
    var numOfArray = array.length;
    function_A.child(array[i]).once(first_para).then(function(A) {
        console.log(A.val());
        if (i < numOfArray) {
            i = i + 1;
            if (i != numOfArray) {
                asy_array_loop(array, function_A, i, first_para);
            }
        } else {}
    })

}

function feedme(senderId) {
    sendQuickLocation(senderId);
}

function sendTime(senderId, time, duration) {
    var d = new Date();
    if (time) {
        var Rtime = time.split(':');
        d.setHours(+Rtime[0]);
        d.setMinutes(Rtime[1]);
        d.setSeconds(Rtime[2]);
    } else if (duration) {
        if (duration.unit = 'min') {
            d.setMinutes(d.getMinutes() + duration.amount);
        } else if (duration.unit = 'h') {
            d.setHours(d.getHours() + duration.amount);
        } else if (duration.unit = 's') {
            d.setSeconds(d.getSeconds() + duration.amount);
        }
    }
    console.log(d.toLocaleString());
    database.ref().child("users").child(senderId).child('chef').child('foodfinishat').set(d.toString()).then(function() {
        console.log('save date successfully');
    });
}

function searchNearBy(senderId) {
    var chefNearBy = [];
    var numOfChef = 0;

    database.ref().child("users").child(senderId).child('coordinates').once("value").then(function(r) {
        console.log(r.val());
        var lat = r.val().lat;
        var lng = r.val().lng;
        var length = 10;
        var geoQuery = geoFire.query({
            center: [lat, lng],
            radius: length
        });
        var k = geoQuery.on("ready", function() {
            console.log('geoQuery is ready');

            geoQuery.cancel();

        });
        // {
        //                         type: 'buy',
        //                         chefId: key,
        //                         price: a.chef.price
        //                     }
        var a = geoQuery.on("key_entered", function(key, location, distance) {
            console.log(key + " entered query at " + location + " (" + distance + " km from center)");
            console.log(chefNearBy);
            firebaseRef.child('users').child(key).once('value').then(function(r) {
                var userData = r.val();
                console.log(userData);
                if (userData.isChef) {
                    var a = userData;
                    var finishTime = new Date(a.chef.foodfinishat);
                    var timeText = finishTime.getHours() + ':' + (finishTime.getMinutes() < 10 ? '0' : '') + finishTime.getMinutes();
                    var temptext = 'Chef: ' + a.firstname + "\n" + 'Food will be ready at: ' + timeText + "\n" + 'Chef address: ' + "\n" + a.coordinates.address;
                    numOfChef = numOfChef + 1;
                    chefNearBy.push(userData);
                    var temp = [{
                        title: a.chef.cuisine_cook + '   ' + a.chef.price + '(EUR)',
                        subtitle: temptext,
                        image_url: a.chef.imgUrl,
                        buttons: [{
                            type: 'postback',
                            title: 'Buy it!',
                            payload: key.toString()
                        }]
                    }];
                    sendGeneric(senderId, temp);
                }
            });
        });
    });

}

function save_num(senderId, num_para) {
    var num = 1;
    if (num_para) {
        num = num_para;
    }
    database.ref().child("users").child(senderId).child('chef').child('number_cook').set(num).then(function() {
        console.log('save number_cook successfully');
    });
}
var buyer_listener = {};
module.exports = (event) => {
    if (!event.witoutapiai) {
        const senderId = event.sender.id;
        const message = event.message.text;
        const apiaiSession = apiAiClient.textRequest(message, { sessionId: senderId });

        apiaiSession.on('response', (response) => {

            var intentName = response.result.metadata.intentName;
            var result = response.result.fulfillment.speech;
            if (intentName === 'Hello') {
                register(senderId, 'https://firebasestorage.googleapis.com/v0/b/fred-cfeea.appspot.com/o/fred_introduce_himself.png?alt=media&token=063c229c-7a7b-4175-aa54-5147f212c272');
            } else if (intentName === 'Feedme') {
                if (response.result.parameters.cuisine) {
                    let cuisine = response.result.parameters.cuisine;
                    database.ref().child("users").child(senderId).child('cuisine_want').set(cuisine).then(function() {
                        feedme(senderId);
                    });
                } else {
                    feedme(senderId);
                }
            } else if (intentName === 'Remove') {
                database.ref().child("users").child(senderId).child('chef').remove();
                database.ref().child("users").child(senderId).child('isChef').set(false);
                console.log('remove');
                sendTextMessage(senderId, "Ok, You successfully cancel the cooking procedure");

                if (buyer_listener[senderId]) {
                    buyer_listener[senderId].off();
                } else {}
            } else if (intentName === 'Hello - email') {
                database.ref().child("users").child(senderId).child('email').set(response.result.parameters.email);
                sendTextMessage(senderId, "Thank you !! The app is still under development.");
                //sendQuickButtonCook_Feed(senderId, 'Thank you !! Start right now!!');
            } else if (intentName === 'Feedme - yes') {
                searchNearBy(senderId);
            } else if (intentName === 'Feedme - no') {
                sendTextMessage(senderId, 'Please provide your address.');
            } else if (intentName === 'chefcook') {
                // initialize the database 
                database.ref().child("users").child(senderId).child('isChef').once('value').then(function(r) {
                    if (r.val() === true) {
                        sendTextMessage(senderId, 'You have already sent the request on the platform. Please remove the previous one');
                    } else {
                        database.ref().child("users").child(senderId).child('chef').remove();
                        database.ref().child('users').child(senderId).child('chef').child('numOfPeople_Request').set(0);
                        database.ref().child("users").child(senderId).child('isChef').set(true).then(function() {
                            buyer_listener[senderId] = firebaseRef.child('users').child(senderId).child('chef').child('buyers').on('child_added', function(childSnapshot, prevChildKey) {
                                console.log(childSnapshot.val());

                                if (childSnapshot.val()) {
                                    let name = childSnapshot.val().name;
                                    let address = childSnapshot.val().address;
                                    let text = name + ' want to order your meal. Address: ' + address;
                                    sendTextMessage(senderId, text).then(function() {
                                        let buttons = [{
                                            type: 'postback',
                                            title: 'Yes',
                                            payload: 'ACCE' + childSnapshot.key
                                        }, {
                                            type: 'postback',
                                            title: 'No',
                                            payload: 'UNAC' + childSnapshot.key
                                        }];
                                        sendButton(senderId, 'Do you want to accept?', buttons);
                                    });
                                }
                            });

                            console.log(response.result.parameters);
                            if (!response.result.parameters.delivery_product[0] && (!response.result.parameters.time && !response.result.parameters.duration)) {
                                save_num(senderId, response.result.parameters.num);
                                sendTextMessage(senderId, 'What will you prepare?');
                            } else if (!response.result.parameters.delivery_product[0]) {
                                save_num(senderId, response.result.parameters.num);
                                sendTime(senderId, response.result.parameters.time, response.result.parameters.duration);
                                sendTextMessage(senderId, 'What will you prepare?');
                            } else if (!response.result.parameters.time && !response.result.parameters.duration) {
                                save_num(senderId, response.result.parameters.num);
                                database.ref().child("users").child(senderId).child('chef').child('cuisine_cook').set(response.result.parameters.delivery_product).then(function() {
                                    console.log('save cuisine_cook successfully');
                                    sendTextMessage(senderId, 'What time will your food be ready?');
                                });
                            } else {
                                sendTime(senderId, response.result.parameters.time, response.result.parameters.duration);
                                var num = 1;
                                if (response.result.parameters.number) {
                                    num = response.result.parameters.number;
                                }
                                database.ref().child("users").child(senderId).child('chef').child('number_cook').set(num).then(function() {
                                    console.log('save number_cook successfully');
                                    database.ref().child("users").child(senderId).child('chef').child('cuisine_cook').set(response.result.parameters.delivery_product).then(function() {
                                        console.log('save cuisine_cook successfully');
                                        sendQuickLocation(senderId);
                                    });
                                });
                            }
                        });
                    }
                });

                //////////////////////////////////////////////////////////////////////////////////////////
                //////////////////////////////////////////////////////////////////////////////////////////
            } else if (intentName === 'chefcook - food') {
                database.ref("/users").child(senderId).child('chef').child('foodfinishat').once("value", function(r) {
                        if (r.val() === null) {
                            database.ref().child("users").child(senderId).child('chef').child('cuisine_cook').set(response.result.parameters.delivery_product).then(function() {
                                sendTextMessage(senderId, 'What time will your food be ready?');
                            });
                        } else {
                            database.ref().child("users").child(senderId).child('chef').child('cuisine_cook').set(response.result.parameters.delivery_product).then(function() {
                                sendQuickLocation(senderId);
                            });
                        }
                    },
                    function(err) {
                        console.log('err');
                    });
                //////////////////////////////////////////////////////////////////////////////////////////
                //////////////////////////////////////////////////////////////////////////////////////////

            } else if (intentName === 'chefcook - time') {
                database.ref("/users").child(senderId).child('chef').child('cuisine_cook').once("value", function(r) {
                        if (r.val() === null) {
                            sendTime(senderId, response.result.parameters.time, response.result.parameters.duration);
                            sendTextMessage(senderId, 'What will you prepare?');
                        } else {
                            sendTime(senderId, response.result.parameters.time, response.result.parameters.duration);
                            sendQuickLocation(senderId);
                        }
                    },
                    function(err) {
                        console.log('err');
                    });
                //////////////////////////////////////////////////////////////////////////////////////////
                //////////////////////////////////////////////////////////////////////////////////////////
            } else if (intentName === 'chefcook - yes') {
                sendTextMessage(senderId, 'please send a beautiful pic of your food~');
            } else if (intentName === 'chefcook - yes - image - money') {
                var amount = response.result.parameters["unit-currency"].amount;
                database.ref().child("users").child(senderId).child('chef').child('price').set(amount).then(function() {
                    sendTextMessage(senderId, "Ok~ Thx. Please waiting for requests");
                });
            } else {
                sendTextMessage(senderId, result);
            }
        });

        apiaiSession.on('error', error => console.log(error));
        apiaiSession.end();
    } else {
        var senderId = event.sender.id;
        if (event.type === 'location') {
            var lng = event.lng;
            var lat = event.lat;
            rp({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: FACEBOOK_ACCESS_TOKEN },
                method: 'POST',
                json: {
                    recipient: { id: senderId },
                    message: { text: event.address },
                }
            }).then(function(body) {
                geoFire.set(senderId, [lat, lng]).then(function() {
                    console.log('the information has been stored');
                    database.ref().child("users").child(senderId).child('coordinates').set({
                        lng: lng,
                        lat: lat,
                        address: event.address
                    }).then(function() {
                        sendQuickButtonYES_NO(senderId, 'Is this address correct, or not?');
                    });
                }, function(error) {
                    console.log("Error: " + error);
                });


            });
        } else if (event.type === 'image') {
            var senderId = event.sender.id;

            const apiaiSession = apiAiClient.textRequest('imagesesegaerfqpe efs d f', { sessionId: senderId });
            apiaiSession.on('response', (response) => {
                var imgUrl = event.imgurl;
                database.ref().child("users").child(senderId).child('chef').child('imgUrl').set(imgUrl).then(function() {
                    database.ref("/users").child(senderId).child('chef').once("value", function(r) {
                            var numOfpeople = r.val().number_cook;
                            var imgUrl = r.val().imgUrl;
                            var cuisine_cook = r.val().cuisine_cook;
                            var foodfinishat = r.val().foodfinishat;
                            var chefs = {
                                number_cook: numOfpeople,
                                imgUrl: imgUrl,
                                cuisine_cook: cuisine_cook,
                                foodfinishat: foodfinishat
                            };
                            var temp = [{
                                title: chefs.cuisine_cook,
                                subtitle: 'Your food will be ready at:' + "\n" + chefs.foodfinishat + "\n You are cooking for " + chefs.number_cook + " people\n",
                                image_url: chefs.imgUrl,
                                buttons: [{
                                    type: 'postback',
                                    title: 'Revise',
                                    payload: senderId.toString()
                                }]
                            }];
                            rp({
                                url: 'https://graph.facebook.com/v2.6/me/messages',
                                qs: { access_token: FACEBOOK_ACCESS_TOKEN },
                                method: 'POST',
                                json: {
                                    recipient: { id: senderId },
                                    message: {
                                        attachment: {
                                            type: 'template',
                                            payload: {
                                                template_type: 'generic',
                                                elements: temp
                                            }
                                        }
                                    },
                                }
                            }).then(function(body) {
                                sendTextMessage(senderId, 'How much per each portion? (EUR)');
                            });
                        },
                        function(err) {
                            console.log('err');
                        });
                });
            })
            apiaiSession.on('error', error => console.log(error));
            apiaiSession.end();
        } else if (event.type === 'select') {
            var senderId = event.sender.id;
            var selectKey = event.selectKey;
            var buyerAddress;
            var buyerName;
            database.ref().child("users").child(senderId).once("value").then(function(r) {
                console.log(r.val());
                buyerAddress = r.val().coordinates.address;
                buyerName = r.val().firstname;
            }).then(function() {
                database.ref().child('users').child(selectKey).once('value').then(function(k) {
                    sendTextMessage(senderId, 'Please wait chef ' + k.val().firstname + ' to confirm');
                    database.ref().child("users").child(selectKey).child('chef').child('buyers').child(senderId).set({
                        name: buyerName,
                        address: buyerAddress,
                        Paid: false
                    })
                })
            })


        } else if (event.type === 'ACCE') {
            var senderId = event.sender.id;
            database.ref().child('users').child(senderId).child('chef').child('buyers').child(event.acceptID).once('value').then(function(t) {
                if (t.val().Accept) {
                    sendTextMessage(senderId, 'You have already accepted that');

                } else {
                    sendTextMessage(senderId, 'OK, you successfully accept that');

                    database.ref().child('users').child(senderId).child('chef').child('buyers').child(event.acceptID).child('Accept').set(true);
                    let buttons = [{
                        type: 'postback',
                        title: 'Pay',
                        payload: 'PAYIT' + senderId
                    }];
                    database.ref().child('users').child(senderId).child('chef').child('price').once('value').then(function(f) {
                        var price = f.val();
                        sendButton(event.acceptID, 'Your request was accepted. Please pay the money. ' + price + ' (EUR)', buttons);
                    })


                }

            });



        } else if (event.type === 'UNAC') {
            var senderId = event.sender.id;
            database.ref().child('users').child(senderId).child('chef').child('buyers').child(event.unacceptID).remove();
            sendTextMessage(senderId, 'OK, we canceled his/her request');
            sendTextMessage(event.unacceptID, 'Sorry, your request was not approved by chef')
        } else if (event.type === 'PAY') {
            var senderId = event.sender.id;
            var receiveId = event.receiveId;
            sendTextMessage(senderId, 'OK, you successfully pay the bill');
            database.ref().child('users').child(receiveId).child('chef').child('price').once('value').then(function(f) {
                sendTextMessage(receiveId, 'You successfully receive money ' + f.val() + ' EUR');
            });

        }
    }
};
