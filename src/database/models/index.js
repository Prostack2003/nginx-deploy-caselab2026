import { Equipment } from './equipment.model.js';
import { EquipmentPassport } from './equipment-passport.model.js';
import { MaintenanceRequest } from './maintenance-request.model.js';
import { Site } from './site.model.js';
import { RequestStatusHistory } from './request-status-history.model.js';
import { Technician } from './technician.model.js';
import { RequestAssignee } from './request-assignee.model.js';
import { User } from './user.model.js';
import { RefreshSession } from './refresh-session.model.js';

Site.hasMany(Equipment, {
    foreignKey: 'siteId',
    as: 'equipment',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

Equipment.belongsTo(Site, {
    foreignKey: 'siteId',
    as: 'site',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

Equipment.hasOne(EquipmentPassport, {
    foreignKey: 'equipmentId',
    as: 'passport',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

EquipmentPassport.belongsTo(Equipment, {
    foreignKey: 'equipmentId',
    as: 'equipment',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

Equipment.hasMany(MaintenanceRequest, {
    foreignKey: 'equipmentId',
    as: 'maintenanceRequests',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

MaintenanceRequest.belongsTo(Equipment, {
    foreignKey: 'equipmentId',
    as: 'equipment',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

MaintenanceRequest.hasMany(RequestStatusHistory, {
    foreignKey: 'requestId',
    as: 'statusHistory',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

RequestStatusHistory.belongsTo(MaintenanceRequest, {
    foreignKey: 'requestId',
    as: 'request',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

Technician.hasMany(RequestAssignee, {
    foreignKey: 'technicianId',
    as: 'assignments',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

MaintenanceRequest.hasMany(RequestAssignee, {
    foreignKey: 'requestId',
    as: 'assignees',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

RequestAssignee.belongsTo(MaintenanceRequest, {
    foreignKey: 'requestId',
    as: 'request',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

RequestAssignee.belongsTo(Technician, {
    foreignKey: 'technicianId',
    as: 'technician',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

MaintenanceRequest.belongsToMany(Technician, {
    through: RequestAssignee,
    foreignKey: 'requestId',
    otherKey: 'technicianId',
    as: 'technicians',
});

Technician.belongsToMany(MaintenanceRequest, {
    through: RequestAssignee,
    foreignKey: 'technicianId',
    otherKey: 'requestId',
    as: 'maintenanceRequests',
    onDelete: 'RESTRICT',
});

Technician.hasOne(User, {
    foreignKey: 'technicianId',
    as: 'user',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

User.belongsTo(Technician, {
    foreignKey: 'technicianId',
    as: 'technician',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

User.hasMany(RefreshSession, {
    foreignKey: 'userId',
    as: 'refreshSessions',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

RefreshSession.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

RefreshSession.belongsTo(RefreshSession, {
    foreignKey: 'replacedBySessionId',
    as: 'replacement',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
});

export {
    Site,
    Equipment,
    EquipmentPassport,
    MaintenanceRequest,
    RequestStatusHistory,
    Technician,
    RequestAssignee,
    User,
    RefreshSession,
};
