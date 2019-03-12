const config = require('../config/common')();
const axios  = require('axios');

class Cornerstone {

  constructor() {
    this.base_url = config.CORNERSTONE_BASE_URL;
    this.connection = null;
  }





  async getConnection() {
    if (null !== this.connection) {
      return this.connection;
    }
    this.connection = await axios.create({baseUrl: this.base_url});

    return this.connection;
  }

  async getLogin() {

    try {

      const response = await this.getConnection().get('/login');

      return response.data;
    } catch (e) {
      console.error(e);
    }
  }

}

module.exports = Cornerstone;