import * as userService from '../services/user.service.js';

async function listUsers(request, response) {
    const { items, meta } = await userService.listUsers(request.validatedQuery);

    response.json({
        data: items,
        meta,
    });
}

async function updateUserAccess(request, response) {
    const user = await userService.updateUserAccess(
        request.params.id,
        request.body
    );

    response.json({
        data: user,
    });
}

export { listUsers, updateUserAccess };
