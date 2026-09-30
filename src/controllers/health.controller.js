function getHealth(request, response) {
    return response.status(200).json({
        data: {
            status: 'ok',
        },
    });
}

export { getHealth };
