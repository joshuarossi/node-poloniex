module.exports = (function() {
    'use strict';

    // Module dependencies
    var crypto  = require('crypto'),
        request = require('request'),
        nonce   = require('nonce')();

    // Constants
    var version         = '0.0.6',
        PUBLIC_API_URL  = 'https://poloniex.com/public',
        PRIVATE_API_URL = 'https://poloniex.com/tradingApi',
        USER_AGENT      = 'SIGBOT ' + version;


    // Helper methods
    function joinCurrencies(currencyA, currencyB){
        // If only one arg, then return the first
        if (typeof currencyB !== 'string'){
            return currencyA;
        }

        return currencyA + '_' + currencyB;
    }

    function sortParameters(a, b){return 0;
        // Sort `nonce` parameter last, and the rest alphabetically
        return a === 'nonce' || a > b ? 1 : -1;
    }


    // Constructor
    function Poloniex(key, secret){
        // Generate headers signed by this user's key and secret.
        // The secret is encapsulated and never exposed
        this._getPrivateHeaders = function(parameters){
            var paramString, signature;

            if (!key || !secret){
                throw 'Poloniex: Error. API key and secret required';
            }

            // Sort parameters alphabetically and convert to `arg1=foo&arg2=bar`
            paramString = Object.keys(parameters).sort(sortParameters).map(function(param){
                return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
            }).join('&');

            signature = crypto.createHmac('sha512', secret).update(paramString).digest('hex');

            return {
                Key: key,
                Sign: signature
            };
        };
    }

    // Currently, this fails with `Error: CERT_UNTRUSTED`
    // Poloniex.STRICT_SSL can be set to `false` to avoid this. Use with caution.
    // Will be removed in future, once this is resolved.
    Poloniex.STRICT_SSL = true;

    // Customisable user agent string
    Poloniex.USER_AGENT = USER_AGENT;

    // Prototype
    Poloniex.prototype = {
        constructor: Poloniex,

        // Make an API request
        _request: function(options, callback){
            if (!('headers' in options)){
                options.headers = {};
            }

            options.json = true;
            options.headers['User-Agent'] = Poloniex.USER_AGENT;
            options.strictSSL = Poloniex.STRICT_SSL;

            request(options, function(err, response, body) {
                // Empty response
                if (!err && (typeof body === 'undefined' || body === null)){
                    err = 'Empty response';
                }

                callback(err, body);
            });

            return this;
        },

        // Make a public API request
        _public: function(command, parameters, callback){
            var options;

            if (typeof parameters === 'function'){
                callback = parameters;
                parameters = {};
            }

            parameters || (parameters = {});
            parameters.command = command;
            options = {
                method: 'GET',
                url: PUBLIC_API_URL,
                qs: parameters
            };

            options.qs.command = command;
            return this._request(options, callback);
        },

        // Make a private API request
        _private: function(command, parameters, callback){
            var options;

            if (typeof parameters === 'function'){
                callback = parameters;
                parameters = {};
            }

            parameters || (parameters = {});
            parameters.command = command;
            parameters.nonce = nonce();

            options = {
                method: 'POST',
                url: PRIVATE_API_URL,
                form: parameters,
                headers: this._getPrivateHeaders(parameters)
            };

            return this._request(options, callback);
        },


        /////


        // PUBLIC METHODS

        getTicker: function(callback){
            return this._public('returnTicker', callback);
        },

        get24hVolume: function(callback){
            return this._public('return24hVolume', callback);
        },

        getOrderBook: function(currencyA, currencyB, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

            return this._public('returnOrderBook', parameters, callback);
        },

        getTradeHistory: function(currencyA, currencyB, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

            return this._public('returnTradeHistory', parameters, callback);
        },


        /////


        // PRIVATE METHODS

        myBalances: function(callback){
            return this._private('returnBalances', callback);
        },

        myOpenOrders: function(currencyA, currencyB, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

            return this._private('returnOpenOrders', parameters, callback);
        },

        allMyOpenOrders: function(callback){
            var parameters = {
                    currencyPair: 'all'
                };

            return this._private('allMyOpenOrders', parameters, callback);
        },

        myTradeHistory: function(currencyA, currencyB, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

            return this._private('returnTradeHistory', parameters, callback);
        },

        buy: function(currencyA, currencyB, rate, amount, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    rate: rate,
                    amount: amount
                };

            return this._private('buy', parameters, callback);
        },

        sell: function(currencyA, currencyB, rate, amount, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    rate: rate,
                    amount: amount
                };

            return this._private('sell', parameters, callback);
        },

        cancelOrder: function(currencyA, currencyB, orderNumber, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    orderNumber: orderNumber
                };

            return this._private('cancelOrder', parameters, callback);
        },
        moveOrder: function(orderNumber, rate, amount, callback){
            args = [];
            Array.prototype.push.apply(args, arguments);
            parameters = {};
            parameters.orderNumber = args.shift();
            parameters.rate = args.shift();
            callback = args.pop();
            if (args.length == 1) parameters.amount = args.shift();
            return this._private('moveOrder', parameters, callback);
        },
        withdraw: function(currency, amount, address, callback){
            var parameters = {
                    currency: currency,
                    amount: amount,
                    address: address
                };

            return this._private('withdraw', parameters, callback);
        },

        getMarginPosition: function(currencyA, currencyB, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

            return this._private('getMarginPosition', parameters, callback);
        },

        marginBuy: function(currencyA, currencyB, rate, amount, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    rate: rate,
                    amount: amount
                };

            return this._private('marginBuy', parameters, callback);
        },

        marginSell: function(currencyA, currencyB, rate, amount, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB),
                    rate: rate,
                    amount: amount
                };

            return this._private('marginSell', parameters, callback);
        },

        closeMarginPosition: function(currencyA, currencyB, callback){
            var parameters = {
                    currencyPair: joinCurrencies(currencyA, currencyB)
                };

            return this._private('closeMarginPosition', parameters, callback);
        }
    };

    return Poloniex;
})();
