function authorizationHandler(req, res, next) {
    if (req.headers.api_key ===  '555jjjj555') {
        next();
    } else {
        res.json('Unauthorized').status(401);
    }
}

module.exports = authorizationHandler;