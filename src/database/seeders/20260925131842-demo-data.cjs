'use strict';

/** @type {import('sequelize-cli').Migration} */

const siteIds = {
    north: '10000000-0000-4000-8000-000000000001',
    south: '10000000-0000-4000-8000-000000000002',
};

const equipmentIds = {
    northTurbineOne: '20000000-0000-4000-8000-000000000001',
    northTurbineTwo: '20000000-0000-4000-8000-000000000002',
    northSensor: '20000000-0000-4000-8000-000000000003',
    southInverter: '20000000-0000-4000-8000-000000000004',
    southSubstation: '20000000-0000-4000-8000-000000000005',
    southSensor: '20000000-0000-4000-8000-000000000006',
};

const passportIds = {
    northTurbineOne: '30000000-0000-4000-8000-000000000001',
    northTurbineTwo: '30000000-0000-4000-8000-000000000002',
    northSensor: '30000000-0000-4000-8000-000000000003',
    southInverter: '30000000-0000-4000-8000-000000000004',
    southSubstation: '30000000-0000-4000-8000-000000000005',
    southSensor: '30000000-0000-4000-8000-000000000006',
};

const technicianIds = {
    turbineEngineer: '40000000-0000-4000-8000-000000000001',
    electricalEngineer: '40000000-0000-4000-8000-000000000002',
    instrumentationEngineer: '40000000-0000-4000-8000-000000000003',
    substationEngineer: '40000000-0000-4000-8000-000000000004',
    diagnosticsEngineer: '40000000-0000-4000-8000-000000000005',
};

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkInsert(
                'sites',
                [
                    {
                        id: siteIds.north,
                        name: 'Северная ветровая площадка',
                        code: 'SITE-NORTH',
                        region: 'Мурманская область',
                        latitude: 68.9707,
                        longitude: 33.0749,
                    },
                    {
                        id: siteIds.south,
                        name: 'Южная солнечная площадка',
                        code: 'SITE-SOUTH',
                        region: 'Краснодарский край',
                        latitude: 45.0355,
                        longitude: 38.9753,
                    },
                ],
                { transaction }
            );
            await queryInterface.bulkInsert(
                'equipment',
                [
                    {
                        id: equipmentIds.northTurbineOne,
                        site_id: siteIds.north,
                        name: 'Ветрогенератор №1',
                        type: 'turbine',
                        serial_number: 'WT-NORTH-001',
                        status: 'operational',
                        installed_at: '2024-03-15',
                    },
                    {
                        id: equipmentIds.northTurbineTwo,
                        site_id: siteIds.north,
                        name: 'Ветрогенератор №2',
                        type: 'turbine',
                        serial_number: 'WT-NORTH-002',
                        status: 'maintenance',
                        installed_at: '2023-07-10',
                    },
                    {
                        id: equipmentIds.northSensor,
                        site_id: siteIds.north,
                        name: 'Метеорологический датчик',
                        type: 'sensor',
                        serial_number: 'SNS-NORTH-001',
                        status: 'fault',
                        installed_at: '2024-01-20',
                    },
                    {
                        id: equipmentIds.southInverter,
                        site_id: siteIds.south,
                        name: 'Сетевой инвертор',
                        type: 'inverter',
                        serial_number: 'INV-SOUTH-001',
                        status: 'operational',
                        installed_at: '2024-04-12',
                    },
                    {
                        id: equipmentIds.southSubstation,
                        site_id: siteIds.south,
                        name: 'Трансформаторная подстанция',
                        type: 'substation',
                        serial_number: 'SUB-SOUTH-001',
                        status: 'operational',
                        installed_at: '2022-09-05',
                    },
                    {
                        id: equipmentIds.southSensor,
                        site_id: siteIds.south,
                        name: 'Датчик солнечной активности',
                        type: 'sensor',
                        serial_number: 'SNS-SOUTH-001',
                        status: 'decommissioned',
                        installed_at: '2021-11-30',
                    },
                ],
                { transaction }
            );

            await queryInterface.bulkInsert(
                'equipment_passports',
                [
                    {
                        id: passportIds.northTurbineOne,
                        equipment_id: equipmentIds.northTurbineOne,
                        manufacturer: 'Vestas',
                        model: 'V150',
                        rated_power: 4200,
                        last_calibration_at: '2025-03-15',
                    },
                    {
                        id: passportIds.northTurbineTwo,
                        equipment_id: equipmentIds.northTurbineTwo,
                        manufacturer: 'Siemens Gamesa',
                        model: 'SG 3.4-132',
                        rated_power: 3400,
                        last_calibration_at: '2025-02-10',
                    },
                    {
                        id: passportIds.northSensor,
                        equipment_id: equipmentIds.northSensor,
                        manufacturer: 'Vaisala',
                        model: 'WXT536',
                        rated_power: 0.05,
                        last_calibration_at: '2025-01-20',
                    },
                    {
                        id: passportIds.southInverter,
                        equipment_id: equipmentIds.southInverter,
                        manufacturer: 'Huawei',
                        model: 'SUN2000-100KTL',
                        rated_power: 100,
                        last_calibration_at: '2025-04-12',
                    },
                    {
                        id: passportIds.southSubstation,
                        equipment_id: equipmentIds.southSubstation,
                        manufacturer: 'Schneider Electric',
                        model: 'SM6',
                        rated_power: 6300,
                        last_calibration_at: null,
                    },
                    {
                        id: passportIds.southSensor,
                        equipment_id: equipmentIds.southSensor,
                        manufacturer: 'Kipp & Zonen',
                        model: 'SMP10',
                        rated_power: 0.1,
                        last_calibration_at: '2025-05-18',
                    },
                ],
                { transaction }
            );

            await queryInterface.bulkInsert(
                'technicians',
                [
                    {
                        id: technicianIds.turbineEngineer,
                        full_name: 'Иван Петров',
                        specialization: 'Обслуживание ветрогенераторов',
                        employee_number: 'EMP-001',
                    },
                    {
                        id: technicianIds.electricalEngineer,
                        full_name: 'Анна Смирнова',
                        specialization: 'Электрические системы',
                        employee_number: 'EMP-002',
                    },
                    {
                        id: technicianIds.instrumentationEngineer,
                        full_name: 'Сергей Волков',
                        specialization: 'Контрольно-измерительные приборы',
                        employee_number: 'EMP-003',
                    },
                    {
                        id: technicianIds.substationEngineer,
                        full_name: 'Елена Кузнецова',
                        specialization: 'Высоковольтные подстанции',
                        employee_number: 'EMP-004',
                    },
                    {
                        id: technicianIds.diagnosticsEngineer,
                        full_name: 'Алексей Орлов',
                        specialization: 'Техническая диагностика',
                        employee_number: 'EMP-005',
                    },
                ],
                { transaction }
            );
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkDelete(
                'technicians',
                {
                    id: Object.values(technicianIds),
                },
                { transaction }
            );

            await queryInterface.bulkDelete(
                'equipment_passports',
                {
                    id: Object.values(passportIds),
                },
                { transaction }
            );

            await queryInterface.bulkDelete(
                'equipment',
                {
                    id: Object.values(equipmentIds),
                },
                { transaction }
            );

            await queryInterface.bulkDelete(
                'sites',
                {
                    id: Object.values(siteIds),
                },
                { transaction }
            );
        });
    },
};
