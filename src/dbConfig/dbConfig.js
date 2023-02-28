const knex = require('knex')({
    client: 'postgresql',
    connection: {
        host: 'serverless-app.cxo7e4g1jkv9.ap-south-1.rds.amazonaws.com',
        database: 'postgres',
        user: 'postgres',
        password: 'postgres'
    }
});

module.exports = knex;
