import { QueryTypes } from 'sequelize';
import { sequelize } from '../database/sequelize.js';

const equipmentLoadSql = `
    WITH filtered_requests AS (
        SELECT
            id,
            equipment_id,
            status
        FROM maintenance_requests
        WHERE (
            $createdFrom::timestamptz IS NULL
            OR created_at >= $createdFrom::timestamptz
        )
        AND (
            $createdTo::timestamptz IS NULL
            OR created_at <= $createdTo::timestamptz
        )
    ),
    request_stats AS (
        SELECT
            equipment_id,
            COUNT(*) AS request_count,
            COUNT(*) FILTER (
                WHERE status IN ('done', 'rejected')
            ) AS closed_request_count
        FROM filtered_requests
        GROUP BY equipment_id
    ),
    labor_stats AS (
        SELECT
            requests.equipment_id,
            SUM(assignees.hours) AS total_planned_hours
        FROM filtered_requests AS requests
        JOIN request_assignees AS assignees
            ON assignees.request_id = requests.id
        GROUP BY requests.equipment_id
    ),
    maintenance_stats AS (
        SELECT
            requests.equipment_id,
            MAX(history.changed_at) AS last_maintenance_at
        FROM filtered_requests AS requests
        JOIN request_status_history AS history
            ON history.request_id = requests.id
            AND history.new_status = 'done'
        GROUP BY requests.equipment_id
    )
    SELECT
        equipment.id,
        equipment.name,
        equipment.type,
        equipment.serial_number AS "serialNumber",
        sites.id AS "siteId",
        sites.name AS "siteName",
        COALESCE(
            request_stats.request_count,
            0
        )::integer AS "requestCount",
        COALESCE(
            request_stats.closed_request_count,
            0
        )::integer AS "closedRequestCount",
        COALESCE(
            labor_stats.total_planned_hours,
            0
        )::double precision AS "totalPlannedHours",
        maintenance_stats.last_maintenance_at AS "lastMaintenanceAt"
    FROM equipment
    JOIN sites
        ON sites.id = equipment.site_id
    LEFT JOIN request_stats
        ON request_stats.equipment_id = equipment.id
    LEFT JOIN labor_stats
        ON labor_stats.equipment_id = equipment.id
    LEFT JOIN maintenance_stats
        ON maintenance_stats.equipment_id = equipment.id
    WHERE COALESCE(request_stats.request_count, 0) >= $minRequests
    ORDER BY "requestCount" DESC, equipment.name ASC
`;

async function findEquipmentLoad(query) {
    const rows = await sequelize.query(equipmentLoadSql, {
        bind: {
            createdFrom: query.createdFrom ?? null,
            createdTo: query.createdTo ?? null,
            minRequests: query.minRequests ?? 0,
        },
        type: QueryTypes.SELECT,
    });

    return rows;
}

export { findEquipmentLoad };
