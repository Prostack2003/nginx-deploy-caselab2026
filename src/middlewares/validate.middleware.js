import {
    createEquipmentBodySchema,
    equipmentIdParamsSchema,
    updateEquipmentBodySchema,
    equipmentQuerySchema,
} from '../validators/equipment.schemas.js';
import {
    requestIdParamsSchema,
    createRequestBodySchema,
    updateRequestBodySchema,
    changeRequestStatusBodySchema,
    requestQuerySchema,
    assignRequestTeamBodySchema,
    requestAssigneeParamsSchema,
} from '../validators/request.schemas.js';
import { siteIdParamsSchema } from '../validators/site.schemas.js';
import { equipmentLoadReportQuerySchema } from '../validators/report.schemas.js';
import { ValidationError } from '../errors/validation.error.js';

function formatZodIssues(issues, fallbackField) {
    return issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join('.') : fallbackField,
        message: issue.message,
    }));
}

function validateBody(schema, request, next) {
    const result = schema.safeParse(request.body);

    if (result.success === false) {
        return next(
            new ValidationError(
                'Переданы некорректные данные',
                formatZodIssues(result.error.issues, 'body')
            )
        );
    }

    request.body = result.data;

    return next();
}

function validateQuery(schema, request, next) {
    const result = schema.safeParse(request.query);

    if (result.success === false) {
        return next(
            new ValidationError(
                'Переданы некорректные параметры запроса',
                formatZodIssues(result.error.issues, 'query')
            )
        );
    }

    request.validatedQuery = result.data;

    return next();
}

function validateParams(schema, request, next) {
    const result = schema.safeParse(request.params);

    if (result.success === false) {
        return next(
            new ValidationError(
                'Переданы некорректные параметры',
                formatZodIssues(result.error.issues, 'params')
            )
        );
    }

    request.params = result.data;

    return next();
}

function validateCreateEquipmentBody(request, response, next) {
    return validateBody(createEquipmentBodySchema, request, next);
}

function validateUpdateEquipmentBody(request, response, next) {
    return validateBody(updateEquipmentBodySchema, request, next);
}

function validateEquipmentIdParams(request, response, next) {
    return validateParams(equipmentIdParamsSchema, request, next);
}

function validateEquipmentQuery(request, response, next) {
    return validateQuery(equipmentQuerySchema, request, next);
}

function validateRequestQuery(request, response, next) {
    return validateQuery(requestQuerySchema, request, next);
}

function validateRequestIdParams(request, response, next) {
    return validateParams(requestIdParamsSchema, request, next);
}

function validateCreateRequestBody(request, response, next) {
    return validateBody(createRequestBodySchema, request, next);
}

function validateUpdateRequestBody(request, response, next) {
    return validateBody(updateRequestBodySchema, request, next);
}

function validateChangeRequestStatusBody(request, response, next) {
    return validateBody(changeRequestStatusBodySchema, request, next);
}

function validateAssignRequestTeamBody(request, response, next) {
    return validateBody(assignRequestTeamBodySchema, request, next);
}

function validateRequestAssigneeParams(request, response, next) {
    return validateParams(requestAssigneeParamsSchema, request, next);
}

function validateSiteIdParams(request, response, next) {
    return validateParams(siteIdParamsSchema, request, next);
}

function validateEquipmentLoadReportQuery(request, response, next) {
    return validateQuery(equipmentLoadReportQuerySchema, request, next);
}

export {
    validateCreateEquipmentBody,
    validateUpdateEquipmentBody,
    validateEquipmentIdParams,
    validateEquipmentQuery,
    validateRequestIdParams,
    validateRequestQuery,
    validateCreateRequestBody,
    validateUpdateRequestBody,
    validateChangeRequestStatusBody,
    validateAssignRequestTeamBody,
    validateRequestAssigneeParams,
    validateSiteIdParams,
    validateEquipmentLoadReportQuery,
};
