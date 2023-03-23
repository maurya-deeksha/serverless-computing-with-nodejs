const Joi = require('joi');

const ValidateJoi = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.validateAsync(req.body);

            next();
        } catch (error) {

            return res.status(422).json({error});
        }
    };
};

const Schemas = {
    tenant: {
        create: Joi.object({
            tenant_name: Joi.string().required(),
            tenant_email: Joi.string().email().required(),
            tenant_code: Joi.string().required(),
            password: Joi.string().required()
        }),
        update: Joi.object({
            tenant_name: Joi.string(),
            tenant_code: Joi.string(),
            tenant_email: Joi.string().email(),
            password: Joi.string(),
            // status: Joi.string()
        }),
        login: Joi.object({
            tenant_email: Joi.string().email().required(),
            password: Joi.string().required()
        }),
    },
    studio: {
        create: Joi.object({
            studio_name: Joi.string().required(),
            studio_code: Joi.string().required(),
            studioAdmin_email: Joi.string().email(),
        }),
        update: Joi.object({
            studio_name: Joi.string().required(),
            studio_code: Joi.string().required(),
            studioAdmin_email: Joi.string().email(),
            status: Joi.string()
        })
    },
    employee: {
        create: Joi.object({
            employee_name: Joi.string().required(),
            employee_email: Joi.string().required().email(),
            studio_name: Joi.string().required(),
        }),
        update: Joi.object({
            employee_name: Joi.string().required(),
            employee_email: Joi.string().required().email(),
            status: Joi.string(),
            studio_name: Joi.string().required(),
        })
    },
};

module.exports = {ValidateJoi, Schemas}
