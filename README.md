# Poloniex

A (unofficial) Node.js API client for the [Poloniex][poloniex].

The client supports both public (unauthenticated) and private (authenticated) calls to the [Poloniex API][poloniex-api].

For private calls, the user secret is never exposed to other parts of the program or over the Web. The user key is sent as a header to the API, along with a signed request.

Repo home: [github.com/sigwo/poloniex][repo]


## License

MIT, open source. See LICENSE file.

## Or clone from GitHub

    git clone https://github.com/sigwo/poloniex.git
    cd poloniex
    npm install


## Require as a module

In your app, require the module:

    var Poloniex = require('poloniex');

If not installed via NPM, then provide the path to poloniex.js

## Create an instance of the client

If only public API calls are needed, then no API key or secret is required:

    var poloniex = new Poloniex();

Or, to use Poloniex's trading API, [your API key and secret][poloniex-keys] must be provided:

    var poloniex = new Poloniex('API_KEY', 'API_SECRET');


## Make API calls

All [Poloniex API][poloniex-api] methods are supported (with some name changes to avoid naming collisions). All methods require a callback function.

The callback is passed two arguments:

1. An error object, or `null` if the API request was successful
2. A data object, the response from the API

For the most up-to-date API documentation, see [poloniex.com/api][poloniex-api].

[repo]: https://github.com/sigwo/poloniex
[poloniex]: https://poloniex.com
[poloniex-api]: https://poloniex.com/api
[poloniex-keys]: https://poloniex.com/apiKeys
