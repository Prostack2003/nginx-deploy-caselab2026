'use strict';

const { maintenanceRequests } = require('./maintenance-requests.cjs');
const { requestStatusHistory } = require('./request-status-history.cjs');
const { requestAssignees } = require('./request-assignees.cjs');

module.exports = {
    maintenanceRequests,
    requestStatusHistory,
    requestAssignees,
};
