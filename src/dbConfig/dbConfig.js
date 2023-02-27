const knex = require('knex')({
    client: 'postgresql',
    connection: {
        // host: 'multitenant-app.cxo7e4g1jkv9.ap-south-1.rds.amazonaws.com',
        database: 'tenants_app',
        user: 'postgres',
        password: 'postgres'
    }
});

module.exports = knex;
