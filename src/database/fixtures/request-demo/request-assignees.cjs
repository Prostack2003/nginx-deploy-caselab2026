'use strict';

const { requestId, technicianId } = require('./id-helpers.cjs');

const requestAssignees = [
    {
        request_id: requestId(2),
        technician_id: technicianId(1),
        role: 'lead',
        hours: 6.5,
    },
    {
        request_id: requestId(2),
        technician_id: technicianId(5),
        role: 'member',
        hours: 3,
    },
    {
        request_id: requestId(6),
        technician_id: technicianId(3),
        role: 'lead',
        hours: 4,
    },
    {
        request_id: requestId(6),
        technician_id: technicianId(5),
        role: 'member',
        hours: 2.5,
    },
    {
        request_id: requestId(10),
        technician_id: technicianId(2),
        role: 'lead',
        hours: 7,
    },
    {
        request_id: requestId(10),
        technician_id: technicianId(5),
        role: 'member',
        hours: 3.5,
    },
    {
        request_id: requestId(14),
        technician_id: technicianId(1),
        role: 'lead',
        hours: 5,
    },
    {
        request_id: requestId(14),
        technician_id: technicianId(3),
        role: 'member',
        hours: 2,
    },
    {
        request_id: requestId(18),
        technician_id: technicianId(3),
        role: 'lead',
        hours: 4.5,
    },
    {
        request_id: requestId(18),
        technician_id: technicianId(5),
        role: 'member',
        hours: 2,
    },
    {
        request_id: requestId(3),
        technician_id: technicianId(3),
        role: 'lead',
        hours: 4,
    },
    {
        request_id: requestId(3),
        technician_id: technicianId(5),
        role: 'member',
        hours: 1.5,
    },
    {
        request_id: requestId(7),
        technician_id: technicianId(1),
        role: 'lead',
        hours: 8,
    },
    {
        request_id: requestId(7),
        technician_id: technicianId(5),
        role: 'member',
        hours: 3,
    },
    {
        request_id: requestId(11),
        technician_id: technicianId(4),
        role: 'lead',
        hours: 6,
    },
    {
        request_id: requestId(11),
        technician_id: technicianId(2),
        role: 'member',
        hours: 4,
    },
    {
        request_id: requestId(15),
        technician_id: technicianId(3),
        role: 'lead',
        hours: 2.5,
    },
    {
        request_id: requestId(15),
        technician_id: technicianId(5),
        role: 'member',
        hours: 1,
    },
    {
        request_id: requestId(19),
        technician_id: technicianId(1),
        role: 'lead',
        hours: 7.5,
    },
    {
        request_id: requestId(19),
        technician_id: technicianId(5),
        role: 'member',
        hours: 3.5,
    },
];

module.exports = { requestAssignees };
