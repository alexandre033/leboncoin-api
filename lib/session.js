const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const { requestHeaders } = require('./utils');
const tough = require('tough-cookie');
const Cookie = tough.Cookie;
const cookieJar = new tough.CookieJar();
const User = require('./user').User;
axiosCookieJarSupport(axios);

class Session {
  constructor(options){
    this.cookieJar = null;
    this.authorizationHeader = null;
    this.header = null;
    this.init(options)
  }

  init(options){
    if (options != null && options.email != null && options.password != null) {
      this.user = new User({ email: options.email, password: options.password });
    }
    this.header = this.getHeader();
    const cookie = Cookie.parse(this.header);
    this.cookieJar = cookieJar.setCookie(cookie, options.url, cb);
  }

  getHeader() {
    const header = {};
    Object.assign(header, requestHeaders);
    if (this.authorizationHeader) {
      header.Authorization = this.authorizationHeader;
    }
    return header;
  };

  login() {
    return this.user.login({ session: this });
  };

  logout() {
    const promise = this.user.logout({ session: this });
    this.cookieJar = cookieJar;
    this.user = null;
    this.authorizationHeader = null;
    return promise;
  };
}

module.exports = Session;
