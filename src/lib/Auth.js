const crypto = require('crypto');
const axios  = require('axios');
const fs     = require('fs');
const config = require('../../config/common')();

/**
 * Set authentification and session for request to Cornerstone api
 */
class Auth {

  constructor({apiId, apiSecret, username, alias, corpname}) {
    this.apiId     = apiId;
    this.apiSecret = apiSecret;
    this.username  = username;
    this.alias     = alias;
    this.corpname  = corpname;
  }

  /**
   * Create signature for authentification
   * @param {string} httpUrl api path like '/services/api/sts/session'
   * @param {string} dateUTC like '2019-03-11T17:05:00.969'
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

  /**
   * Create signature for request reporting or request REST
   * @param {string} method http
   * @param {string} sessionToken
   * @param {string} sessionSecret
   * @param {string} httpUrl
   * @param {string} dateUTC
   * @returns {string}
   */
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
      timeout: 50000,
      headers: {
        'x-csod-api-key':   apiKey,
        'x-csod-date':      dateUTC,
        'x-csod-signature': signature
      }
    });
  }

  /**
   * Create Axios object
   * @param {string} baseUrl
   * @param {string} dateUTC
   * @param {string} token
   * @param {string} signature
   * @returns {Promise<*>}
   */
  async setConnectionSession({baseUrl, dateUTC, token, signature}) {

    return await axios.create({
      baseUrl: baseUrl,
      timeout: 50000,
      headers: {
        'x-csod-date':          dateUTC,
        'x-csod-session-token': token,
        'x-csod-signature':     signature
      }
    });
  }

  /**
   * Set session authentification from cornerstone
   * @param {string} dateUTC
   * @returns {Promise<{alias: *, expiresOn: *, secret: *, status: number | string, token: *}>}
   */
  async setSession({dateUTC}) {
    const sessionFile = await JSON.parse(this.readSession());
    if (sessionFile) {
      const dateNow     = new Date();
      const dateSession = new Date(sessionFile.expiresOn);

      if (dateNow < dateSession) {
        return sessionFile;
      }
    }

    const httpUrl  = config.CORNERSTONE_PATH_SESSION;

    const signature = this.getSignature({
      apiId:     this.apiId,
      apiSecret: this.apiSecret,
      httpUrl:   httpUrl,
      dateUTC:   dateUTC
    });

    const baseUrl = this.getBaseUrl({corpname: this.corpname});

    const path = `${baseUrl}${httpUrl}?userName=${this.username}&alias=${this.alias + Date.now()}`;

    try {
      const connection = await this.setConnection({
        baseUrl:   baseUrl,
        apiKey:    this.apiId,
        dateUTC:   dateUTC,
        signature: signature
      });

      const response = await connection.post(path);

      if (response.data.status !== 201) {
        console.log('[setSession] - Error authentification', response.data)
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
      console.log('[setSession] - Error: ', e);
    }
  }

  /**
   * Get base url
   * @param corpname {string} fice, fice-pilot, fice-stage
   * @returns {string} url
   */
  getBaseUrl({corpname}) {
    return config.CORNERSTONE_BASE_URL.replace('{corpname}', corpname);
  }

  /**
   * Read tmp file session authentification
   * @returns {*}
   */
  readSession() {
    let file;
    if (fs.existsSync(config.TMP_PATH + 'session.json')) {
      file = fs.readFileSync(config.TMP_PATH + 'session.json', 'utf8');
      console.log('[readSession] - session tmp file: ', file);

      return file;
    }

    return null;
  }


}

module
  .exports = Auth;