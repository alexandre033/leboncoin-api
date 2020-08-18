/* eslint-disable no-undef */
const axios = require('axios').default;
const Session = require('../lib/session');


function Init() {
  axios.interceptors.request.use(
    (config) => {
      if(config.session === null || !config.session){
        const newSession = new Session(config);
        console.log(config.session)
        config.session = newSession;
        config.headers = newSession.getHeader();
        config.headers = {...config.headers, cookie: config.session.cookieJar}
      }
      console.log(config)
      return config;
    },
    (error) => {
      return Promise.reject(`HTTP err : ${error}`);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      console.log('res', response)
      return response
    },
    (error) => {
      return Promise.reject(`HTTP err : ${error}`);
    }
  );
}

exports.Init = Init;
