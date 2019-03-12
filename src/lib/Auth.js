const crypto = require('crypto');
const axios  = require('axios');
const config = require('../../config/common')();

class Auth {
  /**
   * Create signature
   * @param apiId {string} your cornerstone api Id
   * @param apiSecret {string} your cornerstone api secret
   * @param httpUrl {string} api path like '/services/api/sts/session'
   * @param dateUTC {string} like '2019-03-11T17:05:00.969'
   * @returns {string}
   */
  getSignature({apiId, apiSecret, httpUrl, dateUTC}) {
    const httpMethod   = 'POST';
    const apiKeyCsod   = 'x-csod-api-key:' + apiId;
    const dateCsod     = 'x-csod-date:' + dateUTC;
    const stringToSign = httpMethod + '\n' + apiKeyCsod + '\n' + dateCsod + '\n' + httpUrl;
    const secretKey    = new Buffer(apiSecret, 'base64');
    const hmac         = crypto.createHmac('sha512', secretKey);

    return hmac.update(stringToSign).digest('base64');
  }

  async getConnection({baseUrl, apiKey, dateUTC, signature}) {

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

  /**
   * Get session from cornerstone
   * @param apiId {string}
   * @param apiSecret {string}
   * @param username {string}
   * @param alias {string}
   * @param corpname {string}
   * @returns {Promise<{alias: *, expiresOn: *, secret: *, status: number | string, token: *}>}
   */
  async getSession({apiId, apiSecret, username, alias, corpname}) {

    const dateTime  = this.getDatetimeUTC();
    const httpUrl   = config.CORNERSTONE_PATH_SESSION;

    const signature = this.getSignature({
      apiId:     apiId,
      apiSecret: apiSecret,
      httpUrl:   httpUrl,
      dateUTC:   dateTime
    });

    const baseUrl = this.getBaseUrl({corpname: corpname});

    const path = baseUrl + httpUrl + '?userName={username}&alias={alias}'
      .replace('{username}', username)
      .replace('{alias}', alias + Date.now());

    try {
      const connection = await this.getConnection({
        baseUrl:   baseUrl,
        apiKey:    apiId,
        dateUTC:   dateTime,
        signature: signature
      });

      const response = await connection.post(path);

      if (response.data.status !== 201) {
        console.log('Error authentification')
      } else {
        return {
          status:    response.data.status,
          token:     response.data.data[0].Token,
          secret:    response.data.data[0].Secret,
          alias:     response.data.data[0].Alias,
          expiresOn: response.data.data[0].ExpiresOn
        };
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


}

module
  .exports = Auth;