const axios = require('axios');

const runwayClient = axios.create({
    baseURL: 'https://api.runwayml.com/v1',
    headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
    },
});

module.exports = runwayClient;
