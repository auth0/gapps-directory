var request = require('request');
var async = require('async');
var GoogleTokenProvider = require('refresh-token').GoogleTokenProvider;
var xtend = require('xtend');
var url = require('url');

/**
 * [Users description]
 *
 * options: 
 *   - domain
 *   - access_token
 *
 *  optionally:
 *   - client_id
 *   - client_secret
 *   - refresh_token
 */
function Users(options){
  this.options = options;
  if(options.refresh_token){
    this._tokenProvider = new GoogleTokenProvider(options);
  }

  this._getToken = function (callback) {
    if(this._tokenProvider) {
      return this._tokenProvider.getToken(callback);
    }
    callback(null, this.options.access_token);
  };

}

// GET https://www.googleapis.com/admin/directory/v1/users
// ?domain=primary domain name&pageToken=token for next results page
// &maxResults=max number of results per page
// &orderBy=email, givenName, or familyName
// &sortOrder=ascending or descending
// &query=email, givenName, or familyName:the query's value*

/**
 * 
 * Fetch a single page of users entries.
 * 
 * @param  {Object}   options {maxResults, orderBy, sortOrder, query, pageToken}
 * @param  {Function} done    callback, with the signature of (err, users, meta)
 */
Users.prototype.getPage = function (options, done) {
  var endpoint = url.parse('https://www.googleapis.com/admin/directory/v1/users');
  if (typeof options == 'function') {
    done = options;
    options = {};
  }
  
  endpoint.query = xtend(options, {
    domain: this.options.domain
  });

  this._getToken(function (err, token){
    if (err) return done(err);
    request.get({
      url: url.format(endpoint),
      headers: { 
        'Authorization': 'OAuth ' + token 
      }
    }, function (err, resp, body) {
      if (err) return done(err);
      if (resp.statusCode === 401) {
        return done(new Error('unauthorized'));
      }
      if (resp.statusCode === 403) {
        return done(new Error('Insufficient Permission'));
      }
      if(~resp.headers['content-type'].indexOf('application/json')){
        body = JSON.parse(body);
        var users = body.users;
        delete body.users;
        return done(null, users, body);
      } 
      return done(new Error(body));
    });
  }.bind(this));
};


/**
 * 
 * Fecha all users entries by recursively downloading all the pages.
 * 
 * @param  {Object}   options {maxResults, orderBy, sortOrder, query, pageToken}
 * @param  {Function} done    callback, with the signature of (err, users, meta)
 */
Users.prototype.getAll = function(options, done) {
  var results = [];
  var currentMeta;
  async.whilst(
    function () {
      return !currentMeta || currentMeta.nextPageToken;
    },
    function (callback) {
      var query = xtend(options, { pageToken: currentMeta && currentMeta.nextPageToken });
      this.getPage(query, function (err, users, meta) { 
        if(err) return callback(err);
        currentMeta = meta; 
        results = results.concat(users);
        callback();
      });
    }.bind(this),
    function (err) {
      if (err) return done(err);
      done(null, results);
    }
  );
};

// GET https://www.googleapis.com/admin/directory/v1/groups?userKey=user key
// ?pageToken=pagination token
// &maxResults=maximum results per response page

Users.prototype.getAllUserGroups = function (email, done) {
  var endpoint = url.parse('https://www.googleapis.com/admin/directory/v1/groups');
  endpoint.query = {
    userKey: email
  };

  this._getToken(function (err, token){
    if (err) return done(err);
    request.get({
      url: url.format(endpoint),
      headers: { 
        'Authorization': 'OAuth ' + token 
      }
    }, function (err, resp, body) {
      if (err) return done(err);
      if (resp.statusCode === 401) {
        return done(new Error('unauthorized'));
      }
      if (resp.statusCode === 403) {
        return done(new Error('Insufficient Permission'));
      }
      if(~resp.headers['content-type'].indexOf('application/json')){
        body = JSON.parse(body);
        var groups = body.groups;
        delete body.groups;
        return done(null, groups, body);
      } 
      return done(new Error(body));
    });
  }.bind(this));
};

module.exports = Users;