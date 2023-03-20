const express = require('express');
const tenantRoutes = require('./route/tenant');
const studioRoutes = require('./route/studio');
const employeesRoutes = require('./route/employee');
const {validateToken} = require("./middleware/jwtVerify");
const Logging = require('./library/logging');
const knex = require("./dbConfig/dbConfig");
const jwt = require("jsonwebtoken");
const app = express();

const ACCESS_TOKEN_SECRET = 'secretkey'
const REFRESH_TOKEN_SECRET = 'secretkeyrefresh'
let refreshTokens = []

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

/** Routes */
app.use('/tenants', validateToken, tenantRoutes);
app.use('/studios', validateToken, studioRoutes);
app.use('/employees', validateToken, employeesRoutes);

app.post('/', async( req, res)=>{
        try {
            const {tenant_name, tenant_email, tenant_code, password} = req.body;
            const tenantTableExists = await knex.schema.hasTable('tenants');
            if (!tenantTableExists) {
                await knex.schema.createTable(`tenants`, (table) => {
                    table.increments('tenant_id').primary().unique();
                    table.string('tenant_name').unique();
                    table.string('tenant_email').unique();
                    table.string('tenant_code').unique();
                    table.string('tenant_role');
                    table.string('password');
                    table.string('status');
                });
                const tenant = await knex('tenants').insert({
                    tenant_name,
                    tenant_email,
                    tenant_code,
                    tenant_role: 'admin',
                    password,
                    status: 'enable',
                });
                Logging.info('Tenant Created!!!')
                res.status(200).json({status: 'OK', message: 'Tenant Created!!!'});
            } else {
                const tenantExists = await knex('tenants').where('tenant_name', tenant_name);
                if (tenantExists.length === 0) {
                    const tenant = await knex('tenants').insert({
                        tenant_name,
                        tenant_email,
                        tenant_code,
                        tenant_role: 'admin',
                        password,
                        status: 'enable',
                    });
                    Logging.info('Tenant Created!!!')
                    res.status(200).json({status: 'OK', message: 'Tenant Created!!!'});
                } else {
                    res.status(400).json({ message: 'Tenant Already Exists!!!'});
                }
            }
        } catch (error) {
            res.status(500).json({error});
        }

})

app.post('/login', async (req, res )=>{
        try {
            const { tenant_email, password } = req.body;
            const tenant = await knex('tenants').where('tenant_email', tenant_email);
            if (tenant.length !==0) {
                if(tenant[0].status === 'enable'){
                    if (tenant[0].password === password) {
                        const accessToken = generateAccessToken({ tenant_email: tenant_email });
                        const refreshToken = generateRefreshToken ({tenant_email: tenant_email})

                        res.status(200).json({ tenant_role: tenant[0].tenant_role, accessToken: accessToken, refreshToken: refreshToken });
                    } else {
                        res.status(403).json({ Error: 'Incorrect password' });
                    }
                } else {
                    res.status(403).json({ Error: 'Tenant Deactivate' });
                }
            } else {
                res.status(404).json({ Error: 'tenant not found' });
            }
        } catch (error) {
            res.status(500).json({ error });
        };
})

app.post("/refreshToken", (req,res) => {
    let tokens;
    if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid")
    jwt.verify(req.body.token, REFRESH_TOKEN_SECRET, (err, token) => {
        if (err) {
            res.status(401).send("Token invalid");
        } else {
             tokens = token
        }
    });
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)

//remove the old refreshToken from the refreshTokens list
    const accessToken = generateAccessToken ({tenant_email: tokens.tenant_email})
    const refreshToken = generateRefreshToken ({tenant_email: tokens.tenant_email})
//generate new accessToken and refreshTokens
    res.json ({accessToken: accessToken, refreshToken: refreshToken})
})

/** Healthcheck */
app.get('/ping', (req, res, next) => res.status(200).json({ hello: 'world1' }));

/** Error handling */
app.use((req, res, next) => {
    const error = new Error('Url Not found');

    Logging.error(error);
    res.status(404).json({
        message: error.message
    });
});

const generateAccessToken = (tenant_email)=> {
    return jwt.sign(tenant_email, ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
}

function generateRefreshToken(tenant_email) {
    const refreshToken =
        jwt.sign(tenant_email, REFRESH_TOKEN_SECRET, {expiresIn: "2m"})
    refreshTokens.push(refreshToken)
    return refreshToken
}

// app.listen(5000, () => {
//     console.log('Demo app is up and listening to port: 5000' );
// });

module.exports = app;
