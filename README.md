# Website Tracker Restful API

This project is inspired by a course on Nodejs i took by [Pirple](pirple.com)

This uses in built node modules that are shipped with node to create a website tracker reastful api from srcatch.

## Features

- Create, Read, Update and Delete Users
- Token Based Authentication
- Background workers to check website status and alert user on status change
- File based database
- Custom templating engine
- Application logging

## How to run API

1. Clone repository and cd into folder

   ```sh
   git clone https:github.com/michealnaita/node-by-pirple api && cd ./api
   ```

2. set enviromental variables for application
   In your terminal

   ```sh
    ACCOUNT_SID=[your-twilio-account-sid]
    AUTH_TOKEN=[your-twilio-auth-token]
    HTTP_PORT=[prefered-http-port-number]
    HTTPS_PORT=[prefered-https-port-number]
    NODE_ENV=development
   ```

3. make sure that node is installed on your system

   ```sh
   node --version
   ```

   or folow installation [guide](https://nodejs.org/en/download/package-manager/)

4. Run application
   ```sh
   node index.js
   ```
5. Test using [Postman](https://www.postman.com)
   > Note: All routes are protected therefore you need to create account get token, then set token in header under the key: token

## Routes

- **/api/users**

  - allowed methods: GET, POST, PUT, DELETE

- **/api/checks**
  - allowed methods: GET, POST, PUT, DELETE
- **/api/tokens**
  - allowed methods: GET, POST, PUT, DELETE
- **/ping**
  - allowed methods: GET

## Credits

- [Twilio](https://www.twilio.com)
- [Pirple](https://www.pirple.com)
