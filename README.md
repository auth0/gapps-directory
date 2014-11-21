(Unofficial) [Google Apps Directory Api](https://developers.google.com/admin-sdk/directory/v1/guides/manage-users#get_all_domain_users) client library.


## Installation

  npm install gapps-directory

## Usage

~~~javascript

var UsersClient = require('gapps-directory').Users;

var usersClient = new UsersClient({
  domain:       'a-gapps-domain.com',
  access_token: 'administrator access token for my application'
});

usersClient.getAll(function (err, users) {
  //..
});
~~~

Otherwise request the first ```access_token``` with [the offline option](https://developers.google.com/accounts/docs/OAuth2WebServer#offline) and provide a ```refresh_token```, ```client_id``` and ```client_secret``` as follows:

~~~javascript

var UsersClient = require('gapps-directory').Users;

var usersClient = new UsersClient({
  domain:        'mydomain.com',
  refresh_token: 'x',
  client_id:     'my app client id',
  client_secret: 'my app client secret'
  /* optionally the first token 
  access_token:  'y',
  expires_in:    '3000'
   */
});
~~~

## Users.getAll([ options, ] callback)

Fetch all the users from the directory API for an specific domain. 

Options can have any of these `maxResults`, `orderBy`, `sortOrder`, `query`

Callback has the following arguments:

-   **err**: if a request return error it will be here
-   **users**: an array with all users 


## Users.getPage([options, ] callback)

Return a single page matching the query criteria (options).

Options can have any of these `maxResults`, `orderBy`, `sortOrder`, `query` and `pageToken`.

The callback returns a meta object wich has the `nextPageToken`.

For instance if you want to get only the two first pages:

~~~javascript
users.getPage(function (err, users, meta) {

  users.getPage({pageToken: meta.nextPageToken}, function (err, usersSecondPage) {

  });
});
~~~

## Todo 

The **Google Directory API** is bigger than this, it has **Groups**, **Nicknames** and so on. You can also create, modify and delete users, groups and nicknames. All this is not supported yet, I will add new things as I need and I will kindly accept pull requests.

## Develop

You will need a Google Apps account, credentials for some application and the admin of the Google Apps account to authorize your application. Then create a ```testing-keys.js``` file in the root of the folder with the following data:

~~~javascript
module.exports = {
  "client_id":              "your client id",
  "client_secret":          "your client secret",
  "domain":                 "the-domain-of-the-gapps-account.com",
  "refresh_token":          "an-admin-refresh-token"
};
~~~

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.
