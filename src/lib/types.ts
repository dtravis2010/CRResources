export type RoleLevel = "CR I" | "CR II";

export type TrainingStatus = {
  incomingTrained: boolean;
  darTrained: boolean;
  cpoeTrained: boolean;
};

export type Employee = {
  id: string;
  name: string;
  roleLevel: RoleLevel;
  active: boolean;
  hireDate?: string;
  endDate?: string;
  training: TrainingStatus;
  notes?: string;
};

export type Entity = {
  id: string;
  code: string;
  displayName: string;
};

export type ColumnType = "dar" | "incoming" | "single" | "freeText";

export type ColumnDefinition = {
  key: string;
  label: string;
  type: ColumnType;
  headerGroupText?: string;
};

export type ScheduleCycle = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  effectiveDate: string;
  status: "draft" | "published";
  notes?: string;
  columnConfig: ColumnDefinition[];
};

export type AssignmentValueType = "X" | "ENTITY_LIST" | "NOTE" | "FREE_TEXT";

export type Assignment = {
  id: string;
  scheduleCycleId: string;
  employeeId: string;
  columnKey: string;
  valueType: AssignmentValueType;
  valueText: string;
  entityCodes?: string[];
};

export type TimeOff = {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: string;
  note?: string;
};

export type Productivity = {
  id: string;
  scheduleCycleId: string;
  entityCode: string;
  darCount: number;
  incomingCount: number;
  cpoeCount?: number;
};

export type DataState = {
  employees: Employee[];
  entities: Entity[];
  scheduleCycles: ScheduleCycle[];
  assignments: Assignment[];
  timeOff: TimeOff[];
  productivity: Productivity[];
};
