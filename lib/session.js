const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();

const User = require('./user').User;
const utils = require('./utils');

const Session = function (options) {
  if (!(this instanceof Session)) return new Session(options);
  this.cookieJar = cookieJar;
  this.authorizationHeader = null;
  if (options != null && options.email != null && options.password != null) {
    this.user = new User({ email: options.email, password: options.password });
  }
};

Session.prototype.getHeader = function () {
  const header = {};
  Object.assign(header, utils.requestHeaders);
  if (this.authorizationHeader) {
    header.Authorization = this.authorizationHeader;
  }
  return header;
};

Session.prototype.login = function () {
  return this.user.login({ session: this });
};

Session.prototype.logout = function () {
  const promise = this.user.logout({ session: this });
  this.cookieJar = cookieJar;
  this.user = null;
  this.authorizationHeader = null;
  return promise;
};

module.exports.Session = Session;
