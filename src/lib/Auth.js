const crypto = require('crypto');
const axios  = require('axios');
const fs     = require('fs');
const config = require('../../config/common')();

class Auth {

  constructor({apiId, apiSecret, username, alias, corpname}) {
    this.apiId     = apiId;
    this.apiSecret = apiSecret;
    this.username  = username;
    this.alias     = alias;
    this.corpname  = corpname;
  }

  /**
   * Create signature
   * @param httpUrl {string} api path like '/services/api/sts/session'
   * @param dateUTC {string} like '2019-03-11T17:05:00.969'
   * @returns {string}
   */
  getSignature({httpUrl, dateUTC}) {
    const httpMethod   = 'POST';
    const apiKeyCsod   = 'x-csod-api-key:' + this.apiId;
    const dateCsod     = 'x-csod-date:' + dateUTC;
    const stringToSign = httpMethod + '\n' + apiKeyCsod + '\n' + dateCsod + '\n' + httpUrl;
    const secretKey    = new Buffer(this.apiSecret, 'base64');
    const hmac         = crypto.createHmac('sha512', secretKey);
    console.log('[getSignature] - signature: ', JSON.stringify(stringToSign));

    return hmac.update(stringToSign).digest('base64');
  }

  getSignatureSession({method, sessionToken, sessionSecret, httpUrl, dateUTC}) {
    const sessionTokenKey = 'x-csod-session-token:' + sessionToken;
    const dateCsod        = 'x-csod-date:' + dateUTC;
    const stringToSign    = method + '\n' + dateCsod + '\n' + sessionTokenKey + '\n' + httpUrl;
    const secretKey       = new Buffer(sessionSecret, 'base64');
    const hmac            = crypto.createHmac('sha512', secretKey);
    console.log('[getSignatureSession] - signature: ', JSON.stringify(stringToSign));

    return hmac.update(stringToSign).digest('base64');
  }

  /**
   * Connection for beginning request
   * @param baseUrl
   * @param apiKey
   * @param dateUTC
   * @param signature
   * @returns {Promise<*>}
   */
  async setConnection({baseUrl, apiKey, dateUTC, signature}) {

    return await axios.create({
      baseUrl: baseUrl,
      timeout: 5000,
      headers: {
        'x-csod-api-key':   apiKey,
        'x-csod-date':      dateUTC,
        'x-csod-signature': signature
      }
    });
  }

  async setConnectionSession({baseUrl, dateUTC, token, signature}) {

    return await axios.create({
      baseUrl: baseUrl,
      timeout: 5000,
      headers: {
        'x-csod-date':          dateUTC,
        'x-csod-session-token': token,
        'x-csod-signature':     signature
      }
    });
  }

  /**
   * Get session from cornerstone
   * @returns {Promise<{alias: *, expiresOn: *, secret: *, status: number | string, token: *}>}
   */
  async setSession() {
    const sessionFile = await JSON.parse(this.readSession());
    if(sessionFile) {
      const dateNow     = new Date();
      const dateSession = new Date(sessionFile.expiresOn);

      if (dateNow < dateSession) {
        return sessionFile;
      }
    }

    const dateTime = this.getDatetimeUTC();
    const httpUrl  = config.CORNERSTONE_PATH_SESSION;

    const signature = this.getSignature({
      apiId:     this.apiId,
      apiSecret: this.apiSecret,
      httpUrl:   httpUrl,
      dateUTC:   dateTime
    });

    const baseUrl = this.getBaseUrl({corpname: this.corpname});

    const path = baseUrl + httpUrl + '?userName={username}&alias={alias}'
      .replace('{username}', this.username)
      .replace('{alias}', this.alias + Date.now());

    try {
      const connection = await this.setConnection({
        baseUrl:   baseUrl,
        apiKey:    this.apiId,
        dateUTC:   dateTime,
        signature: signature
      });

      const response = await connection.post(path);

      if (response.data.status !== 201) {
        console.log('[setSession] - Error authentification')
      } else {
        console.log('[setSession] - status: ', response.data.status);
        const session = {
          status:    response.data.status,
          token:     response.data.data[0].Token,
          secret:    response.data.data[0].Secret,
          alias:     response.data.data[0].Alias,
          expiresOn: response.data.data[0].ExpiresOn
        };
        await fs.writeFile('tmp/session.json', JSON.stringify(session), 'utf8', (e) => {
          if (e) {
            console.log('[setSession] - Error save session file', e);
          } else {
            console.log('[setSession] - Session saved in tmp file');
          }
        });

        return session;
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Get UTC datetime
   * @returns {string} ex: '2019-03-11T17:05:00.969'
   */
  getDatetimeUTC() {
    const dateTimeUTC = new Date().toISOString();

    return dateTimeUTC.substring(0, dateTimeUTC.length - 1);
  }

  /**
   * Get base url
   * @param corpname {string} fice, fice-pilot, fice-stage
   * @returns {string} url
   */
  getBaseUrl({corpname}) {
    return config.CORNERSTONE_BASE_URL.replace('{corpname}', corpname);
  }

  readSession() {
    let file;
    if (fs.existsSync(config.TMP_PATH + 'session.json')) {
      file = fs.readFileSync(config.TMP_PATH + 'session.json', 'utf8');
      console.log('[readSession] - session tmp file: ', file);

      return file;
    }
    file && console.log('3', file);
    return null;
  }


}

module
  .exports = Auth;