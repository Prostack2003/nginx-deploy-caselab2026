'use strict';

const equipmentId = (number) =>
    `20000000-0000-4000-8000-${String(number).padStart(12, '0')}`;

const technicianId = (number) =>
    `40000000-0000-4000-8000-${String(number).padStart(12, '0')}`;

const requestId = (number) =>
    `50000000-0000-4000-8000-${String(number).padStart(12, '0')}`;

const historyId = (number) =>
    `60000000-0000-4000-8000-${String(number).padStart(12, '0')}`;

module.exports = {
    equipmentId,
    technicianId,
    requestId,
    historyId,
};
