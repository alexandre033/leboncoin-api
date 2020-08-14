/* eslint-disable no-undef */
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();

function Init() {
  axios.interceptors.request.use(
    (config) => {
      cookieJar.getCookies(config.url, function (err, cookies) {
        config.headers.cookie = cookies.join('; ');
      });
      console.log('config', config);
      return config;
    },
    (error) => {
      return Promise.reject(`HTTP err : ${error}`);
    }
  );
}

exports.Init = Init;
