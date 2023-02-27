const knex = require('../dbConfig/dbConfig');
const jwt = require('jsonwebtoken');
const Logging = require("../library/logging");

// const ACCESS_TOKEN_SECRET = 'secretkey'

const createTenant = async (req, res) => {
    try {
        const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
        if (tenantEmail[0].tenant_role === 'admin') {
            const {tenant_name, tenant_email, tenant_code, password} = req.body;
            const tenantTableExists = await knex.schema.hasTable('tenants');
            if (!tenantTableExists) {
                await knex.schema.createTable(`tenants`, (table) => {
                    table.increments('tenant_id').primary().unique();
                    table.string('tenant_name').unique();
                    table.string('tenant_email').unique();
                    table.string('tenant_code').unique();
                    table.string('password');
                    table.string('status');
                    table.string('tenant_role');
                });
                await knex('tenants').insert({
                    tenant_name,
                    tenant_email,
                    tenant_code,
                    password,
                    status: 'enable',
                    tenant_role: 'client',
                });
                const tenant = await knex('tenants').where('tenant_email', tenant_email);
                Logging.info('Tenant Created!!!')
                res.status(201).json({status: 'OK', message: 'Tenant Created!!!', data: tenant[0]});
            } else {
                const tenantExists = await knex('tenants').where('tenant_name', tenant_name);
                if (tenantExists.length === 0) {
                    await knex('tenants').insert({
                        tenant_name,
                        tenant_email,
                        tenant_code,
                        password,
                        status: 'enable',
                        tenant_role: 'client'
                    });
                    const tenant = await knex('tenants').where('tenant_email', tenant_email);
                    Logging.info('Tenant Created!!!')
                    res.status(201).json({status: 'OK', message: 'Tenant Created!!!', data: tenant[0]});
                } else {
                    res.send('Tenants Already Exists!');
                }
            }
        } else {
            res.status(403).json({message: 'Only Admin can create a tenant!'});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};

const readTenantById = async (req, res, next) => {
    try {
        const tenant_id = req.params.tenant_id;
        const tenant = await knex('tenants').where('tenant_id', tenant_id);
        tenant ? res.status(200).json({tenant}) : res.status(404).json({message: 'not found'});
    } catch (error) {
        res.status(500).json({error});
    }
};

const readAllTenant = async (req, res, next) => {
    try {
        const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
        if (tenantEmail[0].tenant_role === 'admin') {
            const tenants = await knex('tenants');
            res.status(200).json({tenants});
        } else {
            res.status(403).json({message: 'Only Admin List all tenant!'});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};

const updateTenant = async (req, res, next) => {
    try {
        const tenant_id = req.params.tenant_id;
        const {tenant_name, tenant_code, tenant_email, password, status} = req.body;
        const tenantStatusCheck = await knex('tenants').where('tenant_id', tenant_id);
        if (tenantStatusCheck[0].status === 'enable') {
            const tenant = await knex('tenants').where('tenant_id', tenant_id).update({
                tenant_name,
                tenant_code,
                tenant_email,
                password,
                status
            }, '*');
            res.status(200).json({tenant});
        } else {
            res.status(403).json('Tenant deactivated!!!');
        }
    } catch (error) {
        res.status(500).json({error});
    }
};

// const disableTenant = async (req, res, next) => {
//     try {
//         const tenant_id = req.params.tenant_id;
//         const tenant = await knex('tenants').where('tenant_id', tenant_id).update({status: 'disable'}, '*');
//         tenant ? res.status(200).json({tenant, message: 'Disabled'}) : res.status(404).json({message: 'not found'});
//     } catch (error) {
//         res.status(500).json({error});
//     }
// };

// const tenantLogin = async (req, res, next) => {
//     try {
//         const { tenant_email, password } = req.body;
//         const tenant = await knex('tenants').where('tenant_email', tenant_email);
//         if (tenant) {
//             if(tenant[0].status === 'enable'){
//                 if (tenant[0].password === password) {
//                     const accessToken = generateAccessToken({ tenant_email: tenant_email });
//                     res.status(200).json({ accessToken: accessToken });
//                 } else {
//                     res.status(403).json({ Error: 'Incorrect password' });
//                 }
//             } else {
//                 res.status(403).json({ Error: 'Tenant Deactivate' });
//             }
//         } else {
//             res.status(404).json({ message: 'tenant not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ error });
//     }
// };

// accessTokens
// const generateAccessToken = (tenant_email)=> {
//     return jwt.sign(tenant_email, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
// }

module.exports = {createTenant, readTenantById, readAllTenant, updateTenant};
