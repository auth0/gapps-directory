var Users = require('../lib/Users'),
  testingKeys = require('../testing-keys');

describe('Users module', function () {

  var users = new Users({
    client_id:      testingKeys.client_id,
    client_secret:  testingKeys.client_secret,
    refresh_token:  testingKeys.refresh_token,
    domain:         testingKeys.domain
  });
  
  it('retrieve a list of users', function (done) {
    users.getPage(function (err, users) {
      if (err) return done(err);
      users[0].should.have.property('id');
      users[0].should.have.property('emails');
      users[0].should.have.property('name');
      done();
    });
  });
  
  it('can fetch next page', function (done) {
    users.getPage({maxResults: 2}, function (err, users1, meta) {
      if (err) return done(err);
      users.getPage({maxResults: 2, pageToken: meta.nextPageToken}, function (err, users2) {
        var distinct_ids = users1.concat(users2).map(function (u) {
          return u.id;
        }).filter(function (uid, index, array) {
          return index == array.indexOf(uid); //remove duplicates
        });
        distinct_ids.length.should.eql(4);
        done();
      });
    });
  });
  
  it('should return proper error with an invalid access token', function (done) {
    var usersFail = new Users({
      client_id:      testingKeys.client_id,
      client_secret:  testingKeys.client_secret,
      access_token:   'wrong!',
      domain:         testingKeys.domain
    });
    usersFail.getPage(function (err) {
      err.message.should.be.eql('unauthorized');
      done();
    });
  });

  it('can fetch all users', function (done) {
    users.getAll({maxResults: 2}, function (err, users) {
      if (err) return done(err);

      var distinct_ids = users.map(function (u) {
        return u.id;
      }).filter(function (uid, index, array) {
        return index == array.indexOf(uid); //remove duplicates
      });

      distinct_ids.length.should.be.above(2);

      done();
    });
  });
});