var passport = require('passport-strategy');
var util = require('util');

function Strategy(options, verify) {
    if(typeof options === 'function') {
        verify = options;
        options = {};
    }

    if(!verify) throw new Error('OAuth 2.0 client nosecret strategy requires a verify function');

    passport.Strategy.call(this);

    this.name = 'oauth2-client-nosecret';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req) {
    const noClientInBody = !req.body || !req.body['client_id'];
    const noClientInHeaders = !req.headers || !req.headers['cid'];

    if(noClientInBody && noClientInHeaders) return this.fail();

    var clientId = req.body['client_id'] || req.headers['cid'];
    var clientSecret = req.body['client_secret'];
    var self = this;

    function verified(err, client, info) {
        if(err) return self.error(err);

        if(!client) return self.fail();

        self.success(client, info);
    }

    if(self._passReqToCallback) this._verify(req, clientId, clientSecret, verified);
    else this._verify(clientId, clientSecret, verified);
};

module.exports = {Strategy};
