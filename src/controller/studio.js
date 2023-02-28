const knex = require('../dbConfig/dbConfig');

const createStudio = async (req, res) => {
    try {
        const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
        const {studio_name, studio_code, studioAdmin_email} = req.body;
        const exists = await knex.schema.hasTable('studios');
        if (!exists) {
            await knex.schema.createTable(`studios`, (table) => {
                table.increments('studio_id').primary().unique();
                table.string('studio_name');
                table.string('studio_code');
                table.string('studioAdmin_email');
                table.string('status');
                table.integer('tenant_id').unsigned().index().references('tenant_id').inTable('tenants');
            });
            await knex(`studios`).insert({
                studio_name,
                studio_code,
                studioAdmin_email,
                status: 'enable',
                tenant_id: tenantEmail[0].tenant_id
            });
            res.status(200).json({status: 'OK', message: 'Studio Created!!!'});
        } else {
            const studio = await knex(`studios`)
                .where('tenant_id', tenantEmail[0].tenant_id)
                .andWhere('studio_name', studio_name)
                .andWhere('studio_code', studio_code);
            if (studio.length === 0) {
                await knex(`studios`).insert({
                    studio_name,
                    studio_code,
                    studioAdmin_email,
                    status: 'enable',
                    tenant_id: tenantEmail[0].tenant_id
                });
                res.status(201).json({status: 'OK', message: 'Studio Created!!!'});
            } else {
                res.status(400).json({Error:`Studio Already Exists!!!`});
            }
        }
    } catch (error) {
        res.status(500).json({error});
    }
};

const readStudioByStudioId = async (req, res, next) => {
    const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
    const studio_id = req.params.studio_id;
    await knex(`studios`)
        .where('tenant_id', tenantEmail[0].tenant_id)
        .andWhere('studio_id', studio_id)
        .then((studio) =>{
        if(studio.length !== 0) {
            res.status(200).json({studio})
        } else {
            res.status(404).json({message: 'not found'})
        }
        })
        .catch((error) => res.status(500).json({error}));
};

const readStudiosBytenant = async (req, res, next) => {
    const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
    await knex(`studios`)
        .where('tenant_id', tenantEmail[0].tenant_id)
        .then((studios) => res.status(200).json({studios}))
        .catch((error) => res.status(500).json({error}));
};
const updateStudio = async (req, res, next) => {
    try {
        const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
        const studio_id = req.params.studio_id;
        const {studio_name, studio_code, studioAdmin_email, status} = req.body;
        const updatedStudio = await knex(`studios`).where('tenant_id', tenantEmail[0].tenant_id).andWhere('studio_id', studio_id).update({
            studio_name,
            studio_code,
            studioAdmin_email,
            status
        }, '*');
        if(updatedStudio.length !== 0){
            res.status(200).json({status: 'updated', data: updatedStudio});
        } else{
            res.status(404).json({message: 'studio not found'});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};
// const disableStudio = async (req, res, next) => {
//     try {
//         const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
//         const studio_id = req.params.studio_id;
//         const studio = await knex('studios')
//             .where('tenant_id', tenantEmail[0].tenant_id)
//             .andWhere('studio_id', studio_id)
//             .update({status: 'disable'}, '*');
//         studio ? res.status(200).json({studio, message: 'Disabled'}) : res.status(404).json({message: 'not found'});
//     } catch (error) {
//         res.status(500).json({error});
//     }
// };

module.exports = {createStudio, readStudioByStudioId, readStudiosBytenant, updateStudio};
