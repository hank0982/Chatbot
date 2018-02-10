module.exports = (req, res) => {
    const hubChallenge = req.query['hub.challenge'];

    const hubMode = req.query['hub.mode'];
    const verifyTokenMatches = (req.query['hub.verify_token'] === '');

    if (hubMode && verifyTokenMatches) {
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        res.status(403).end();
    }
};