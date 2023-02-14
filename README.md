# my-crypto

A crypto untility service leveraging [tsoa](https://tsoa-community.github.io/docs/), [CCXT](https://github.com/ccxt/ccxt) and [Prisma](https://www.prisma.io/). Built to releive the pain of managing user data from multiple exchanges/brokerages. 

## Features

- User auth with JWT and Bcrypt. Encrypts user keys safetly and securely.
- User-Exchange storage. Ability to store and process exchange data for specific users
- CSV trade-history export integration.
- Socket integration for fresh price and trading data
