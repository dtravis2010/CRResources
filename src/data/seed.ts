import { DataState } from "../lib/types";

export const seedData: DataState = {
  employees: [
    {
      id: "emp-alyssa",
      name: "Alyssa",
      roleLevel: "CR II",
      active: true,
      hireDate: "2022-02-10",
      training: { incomingTrained: true, darTrained: true, cpoeTrained: true },
      notes: "Team lead"
    },
    {
      id: "emp-casey",
      name: "Casey",
      roleLevel: "CR II",
      active: true,
      hireDate: "2021-09-14",
      training: { incomingTrained: true, darTrained: true, cpoeTrained: false }
    },
    {
      id: "emp-chasity",
      name: "Chasity",
      roleLevel: "CR I",
      active: true,
      hireDate: "2023-05-01",
      training: { incomingTrained: true, darTrained: true, cpoeTrained: false }
    },
    {
      id: "emp-linh",
      name: "Linh",
      roleLevel: "CR I",
      active: true,
      hireDate: "2023-11-12",
      training: { incomingTrained: true, darTrained: false, cpoeTrained: false }
    },
    {
      id: "emp-trish",
      name: "Trish",
      roleLevel: "CR II",
      active: true,
      hireDate: "2020-03-09",
      training: { incomingTrained: true, darTrained: true, cpoeTrained: true }
    }
  ],
  entities: [
    { id: "ent-thp", code: "THP", displayName: "Texas Health Plano" },
    { id: "ent-thps", code: "THPS", displayName: "Texas Health Presbyterian Plano" },
    { id: "ent-thfm", code: "THFM", displayName: "Texas Health Frisco" },
    { id: "ent-thsw", code: "THSW", displayName: "Texas Health Southwest" },
    { id: "ent-tham", code: "THAM", displayName: "Texas Health Arlington" },
    { id: "ent-thal", code: "THAL", displayName: "Texas Health Allen" },
    { id: "ent-thd", code: "THD", displayName: "Texas Health Denton" },
    { id: "ent-thr", code: "THR", displayName: "Texas Health Rockwall" },
    { id: "ent-theb", code: "HEB", displayName: "Harris Methodist Hospital" },
    { id: "ent-fw", code: "FW", displayName: "Fort Worth" },
    { id: "ent-tha", code: "THA", displayName: "Texas Health Alliance" },
    { id: "ent-thb", code: "THB", displayName: "Texas Health Bedford" },
    { id: "ent-ths", code: "THS", displayName: "Texas Health Southlake" },
    { id: "ent-thc", code: "THC", displayName: "Texas Health Cleburne" },
    { id: "ent-thk", code: "THK", displayName: "Texas Health Kaufman" },
    { id: "ent-thf", code: "THF", displayName: "Texas Health Flower Mound" }
  ],
  scheduleCycles: [
    {
      id: "cycle-2025-may-jun",
      title: "Clinical Review Schedule May and June",
      startDate: "2025-05-19",
      endDate: "2025-06-30",
      effectiveDate: "2025-05-19",
      status: "published",
      notes: "Sample published cycle",
      columnConfig: [
        { key: "TEAM_MEMBER", label: "TEAM MEMBER", type: "single" },
        { key: "DAR_1", label: "DAR 1", type: "dar", headerGroupText: "THP/THPS/THFM" },
        { key: "DAR_2", label: "DAR 2", type: "dar", headerGroupText: "THSW/THAM/THAL/THD" },
        { key: "DAR_3", label: "DAR 3", type: "dar", headerGroupText: "THR/THF/THS/HEB" },
        { key: "DAR_4", label: "DAR 4", type: "dar", headerGroupText: "THFW/THAZ/THC/THWP" },
        { key: "CPOE", label: "CPOE", type: "single" },
        { key: "INCOMING_1", label: "New Incoming Items", type: "incoming", headerGroupText: "THA/THB/THS" },
        { key: "CROSS_TRAINING", label: "Cross-Training", type: "freeText" },
        { key: "SPECIAL_PROJECTS", label: "Special Projects/Assignments", type: "freeText" },
        { key: "EMAIL_PRIMARY", label: "3P Email (Primary)", type: "single" },
        { key: "EMAIL_BACKUP", label: "3P Email (Backup)", type: "single" },
        { key: "FLOAT", label: "Float", type: "single" }
      ]
    }
  ],
  assignments: [
    {
      id: "assign-alyssa-dar1",
      scheduleCycleId: "cycle-2025-may-jun",
      employeeId: "emp-alyssa",
      columnKey: "DAR_1",
      valueType: "X",
      valueText: "X",
      entityCodes: ["THP", "THPS", "THFM"]
    },
    {
      id: "assign-casey-incoming",
      scheduleCycleId: "cycle-2025-may-jun",
      employeeId: "emp-casey",
      columnKey: "INCOMING_1",
      valueType: "ENTITY_LIST",
      valueText: "THAL/THB/THS",
      entityCodes: ["THAL", "THB", "THS"]
    },
    {
      id: "assign-trish-cpoe",
      scheduleCycleId: "cycle-2025-may-jun",
      employeeId: "emp-trish",
      columnKey: "CPOE",
      valueType: "NOTE",
      valueText: "CPOE"
    },
    {
      id: "assign-linh-email",
      scheduleCycleId: "cycle-2025-may-jun",
      employeeId: "emp-linh",
      columnKey: "EMAIL_PRIMARY",
      valueType: "NOTE",
      valueText: "3:01PM EMAIL"
    },
    {
      id: "assign-chasity-special",
      scheduleCycleId: "cycle-2025-may-jun",
      employeeId: "emp-chasity",
      columnKey: "SPECIAL_PROJECTS",
      valueType: "FREE_TEXT",
      valueText: "SPECIAL PROJECT"
    }
  ],
  timeOff: [
    {
      id: "timeoff-alyssa",
      employeeId: "emp-alyssa",
      startDate: "2025-06-10",
      endDate: "2025-06-14",
      type: "PTO",
      note: "Family trip"
    }
  ],
  productivity: [
    {
      id: "prod-thp",
      scheduleCycleId: "cycle-2025-may-jun",
      entityCode: "THP",
      darCount: 120,
      incomingCount: 45
    }
  ]
};
