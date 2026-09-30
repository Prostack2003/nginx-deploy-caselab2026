import { RequestStatusHistory } from '../database/models/index.js';

async function findByRequestId(requestId) {
    const history = await RequestStatusHistory.findAll({
        where: {
            requestId,
        },
        attributes: [
            'id',
            'oldStatus',
            'newStatus',
            'changedBy',
            'comment',
            'changedAt',
        ],
        order: [['changedAt', 'ASC']],
    });

    return history.map((historyItem) => historyItem.get({ plain: true }));
}

export { findByRequestId };
