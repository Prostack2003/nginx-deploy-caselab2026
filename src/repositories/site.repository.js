import { QueryTypes } from 'sequelize';
import { sequelize } from '../database/sequelize.js';

const REQUEST_STATUSES = ['new', 'in_progress', 'done', 'rejected'];
const REQUEST_PRIORITIES = ['low', 'medium', 'high', 'critical'];

function queryOptions(siteId) {
    return {
        bind: { siteId },
        type: QueryTypes.SELECT,
    };
}

async function findSiteById(siteId) {
    const [site] = await sequelize.query(
        `
            SELECT
                id,
                name,
                code,
                region,
                latitude,
                longitude
            FROM sites
            WHERE id = $siteId
        `,
        queryOptions(siteId)
    );

    return site ?? null;
}

async function countRequestsByStatus(siteId) {
    return sequelize.query(
        `
            SELECT
                requests.status::text AS value,
                COUNT(*)::integer AS count
            FROM maintenance_requests AS requests
            JOIN equipment
                ON equipment.id = requests.equipment_id
            WHERE equipment.site_id = $siteId
            GROUP BY requests.status
        `,
        queryOptions(siteId)
    );
}

async function countRequestsByPriority(siteId) {
    return sequelize.query(
        `
            SELECT
                requests.priority::text AS value,
                COUNT(*)::integer AS count
            FROM maintenance_requests AS requests
            JOIN equipment
                ON equipment.id = requests.equipment_id
            WHERE equipment.site_id = $siteId
            GROUP BY requests.priority
        `,
        queryOptions(siteId)
    );
}

async function calculateAverageClosureHours(siteId) {
    const [result] = await sequelize.query(
        `
            SELECT
                COALESCE(
                    DATE_PART(
                        'epoch',
                        AVG(history.changed_at - requests.created_at)
                    ) / 3600.0,
                    0
                )::double precision AS "averageClosureHours"
            FROM request_status_history AS history
            JOIN maintenance_requests AS requests
                ON requests.id = history.request_id
            JOIN equipment
                ON equipment.id = requests.equipment_id
            WHERE equipment.site_id = $siteId
              AND history.new_status IN ('done', 'rejected')
        `,
        queryOptions(siteId)
    );

    return Number(result['averageClosureHours'] ?? 0);
}

function createCountMap(values, rows) {
    const result = {};

    for (const value of values) {
        result[value] = 0;
    }

    for (const row of rows) {
        result[row.value] = row.count;
    }

    return result;
}

async function findSummaryById(siteId) {
    const site = await findSiteById(siteId);

    if (site === null) {
        return null;
    }

    const [statusRows, priorityRows, averageClosureHours] = await Promise.all([
        countRequestsByStatus(siteId),
        countRequestsByPriority(siteId),
        calculateAverageClosureHours(siteId),
    ]);

    const requestsByStatus = createCountMap(REQUEST_STATUSES, statusRows);
    const requestsByPriority = createCountMap(REQUEST_PRIORITIES, priorityRows);
    const totalRequests = Object.values(requestsByStatus).reduce(
        (total, count) => total + count,
        0
    );

    return {
        ...site,
        totalRequests,
        requestsByStatus,
        requestsByPriority,
        averageClosureHours,
    };
}

export { findSummaryById };
