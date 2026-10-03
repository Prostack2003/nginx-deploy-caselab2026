import { QueryTypes } from 'sequelize';
import { sequelize } from '../database/sequelize.js';
import { Site } from '../database/models/index.js';

const REQUEST_STATUSES = ['new', 'in_progress', 'done', 'rejected'];
const REQUEST_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const SITE_ATTRIBUTES = [
    'id',
    'name',
    'code',
    'region',
    'latitude',
    'longitude',
    'createdAt',
    'updatedAt',
];
const SITE_SORT_FIELDS = {
    name: 'name',
    code: 'code',
    region: 'region',
};

async function create(siteData) {
    const site = await Site.create({
        name: siteData.name,
        code: siteData.code,
        region: siteData.region,
        latitude: siteData.location.lat,
        longitude: siteData.location.lon,
    });

    return site.get({ plain: true });
}

async function findAll(query = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const sortField = SITE_SORT_FIELDS[query.sortBy] ?? 'name';
    const sortDirection = query.order === 'desc' ? 'DESC' : 'ASC';

    const { rows, count } = await Site.findAndCountAll({
        attributes: SITE_ATTRIBUTES,
        order: [[sortField, sortDirection]],
        limit,
        offset,
    });

    return {
        rows: rows.map((site) => site.get({ plain: true })),
        count,
    };
}

async function findById(siteId) {
    const site = await Site.findByPk(siteId, {
        attributes: SITE_ATTRIBUTES,
    });

    return site === null ? null : site.get({ plain: true });
}

async function update(siteId, changes) {
    const site = await Site.findByPk(siteId);

    if (site === null) {
        return null;
    }

    const databaseChanges = { ...changes };

    delete databaseChanges.location;

    if (changes.location !== undefined) {
        databaseChanges.latitude = changes.location.lat;
        databaseChanges.longitude = changes.location.lon;
    }

    await site.update(databaseChanges);

    return site.get({ plain: true });
}

async function remove(siteId) {
    const deletedCount = await Site.destroy({
        where: {
            id: siteId,
        },
    });

    return deletedCount > 0;
}

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

export { create, findAll, findById, update, remove, findSummaryById };
