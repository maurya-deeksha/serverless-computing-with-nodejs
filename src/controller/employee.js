const knex = require('../dbConfig/dbConfig');

const createEmployee = async (req, res) => {
    try {
        const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
        const {employee_name, employee_email, studio_name} = req.body;
        const studioId = await knex(`studios`)
            .where('tenant_id', tenantEmail[0].tenant_id)
            .andWhere('studio_name', studio_name);
        if(studioId.length !== 0 ){
            if (studioId[0].status === 'enable') {
                await knex.schema.hasTable('employees').then(async (exists) => {
                    if (!exists) {
                        await knex.schema.createTable(`employees`, (table) => {
                            table.increments('employee_id').primary().unique();
                            table.string('employee_name');
                            table.string('employee_email').unique();
                            table.string('status');
                            table.string('studio_name');
                            table.integer('studio_id').unsigned().index().references('studio_id').inTable(`studios`);
                            table.integer('tenant_id').unsigned().index().references('tenant_id').inTable('tenants');
                        });
                        await knex(`employees`).insert({
                            employee_name,
                            employee_email,
                            status: 'enable',
                            studio_name,
                            studio_id: studioId[0].studio_id,
                            tenant_id: tenantEmail[0].tenant_id,
                        });
                        res.status(200).json({status: 'OK', message: 'Employee Created!!!'});
                    } else {
                        await knex(`employees`).insert({
                            employee_name,
                            employee_email,
                            status: 'enable',
                            studio_name,
                            studio_id: studioId[0].studio_id,
                            tenant_id: tenantEmail[0].tenant_id,
                        });
                        res.status(200).json({status: 'OK', message: 'Employee Created!!!'});
                    }
                });
            } else {
                res.status(400).json({Error:'Sorry, could not create user for disabled studio'})
            }
        } else {
            res.status(404).json({Error: 'Studio Not Found'})
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({error});
    }
};

const readEmployeeById = async (req, res, next) => {
    const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
    const employee_id = req.params.employee_id;
    await knex(`employees`)
        .where('tenant_id', tenantEmail[0].tenant_id)
        .andWhere('employee_id', employee_id)
        .then((employee) => {
            if(employee.length !== 0) {
                res.status(200).json({employee})
            } else {
                res.status(404).json({message: 'not found'})
            }
        })
        .catch((error) => res.status(500).json({error}));
};

const readAllEmployee = async (req, res, next) => {
    const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
    await knex(`employees`)
        .where('tenant_id', tenantEmail[0].tenant_id)
        .then((users) => res.status(200).json({users}))
        .catch((error) => res.status(500).json({error}));
};
const readUserByStudioId = async (req, res, next) => {
    const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
    const studio_name = req.params.studio_name;
    await knex(`employees`)
        .where('tenant_id', tenantEmail[0].tenant_id)
        .andWhere('studio_name', studio_name)
        .then((users) => res.status(200).json({users}))
        .catch((error) => res.status(500).json({error}));
};
const updateEmployee = async (req, res, next) => {
    try {
        const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
        const employee_id = req.params.employee_id;
        const {employee_name, employee_email,status, studio_name} = req.body;
        const studioId = await knex(`studios`)
            .where('tenant_id', tenantEmail[0].tenant_id)
            .andWhere('studio_name', studio_name);
        if(studioId.length !==0){
            const updatedUser = await knex(`employees`)
                .where('tenant_id', tenantEmail[0].tenant_id)
                .andWhere('employee_id', employee_id)
                .update({employee_name, employee_email, status, studio_name, studio_id: studioId[0].studio_id}, '*');
            if(updatedUser.length !== 0){
                res.status(200).json({status: 'updated', data: updatedUser});
            } else{
                res.status(404).json({message: 'user not found'});
            }
        }
        else{
            res.status(404).json({message: 'studio not found'});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};

// const deleteEmployee = async (req, res, next) => {
//     try {
//         const tenantEmail = await knex('tenants').where('tenant_email', req.token.tenant_email);
//         const employee_id = req.params.employee_id;
//         const studio = await knex('employees')
//             .where('tenant_id', tenantEmail[0].tenant_id)
//             .andWhere('employee_id', employee_id)
//             .update({status: 'disable'}, '*');
//         studio ? res.status(200).json({studio, message: 'Disabled'}) : res.status(404).json({message: 'not found'});
//     } catch (error) {
//         res.status(500).json({error});
//     }
// };

module.exports = {createEmployee, readEmployeeById, readUserByStudioId, readAllEmployee, updateEmployee};
