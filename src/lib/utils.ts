import { Assignment, Employee, ScheduleCycle, TimeOff } from "./types";

export const formatDateRange = (start: string, end: string) => {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
};

export const isDateOverlap = (start: string, end: string, rangeStart: string, rangeEnd: string) => {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  const rangeStartDate = new Date(rangeStart).getTime();
  const rangeEndDate = new Date(rangeEnd).getTime();
  return startDate <= rangeEndDate && endDate >= rangeStartDate;
};

export const isEmployeeOffInCycle = (
  employee: Employee,
  cycle: ScheduleCycle,
  timeOff: TimeOff[]
) =>
  timeOff.some((entry) =>
    entry.employeeId === employee.id &&
    isDateOverlap(entry.startDate, entry.endDate, cycle.startDate, cycle.endDate)
  );

export const getAssignment = (
  assignments: Assignment[],
  cycleId: string,
  employeeId: string,
  columnKey: string
) =>
  assignments.find(
    (assignment) =>
      assignment.scheduleCycleId === cycleId &&
      assignment.employeeId === employeeId &&
      assignment.columnKey === columnKey
  );

export const buildCoverageWarnings = (
  cycle: ScheduleCycle,
  assignments: Assignment[]
) => {
  const warnings: string[] = [];

  const cycleAssignments = assignments.filter(
    (assignment) => assignment.scheduleCycleId === cycle.id
  );

  const hasCpoe = cycleAssignments.some(
    (assignment) => assignment.columnKey === "CPOE" && assignment.valueText.trim()
  );
  if (!hasCpoe) warnings.push("No CPOE assignee yet.");

  const hasEmailPrimary = cycleAssignments.some(
    (assignment) => assignment.columnKey === "EMAIL_PRIMARY" && assignment.valueText.trim()
  );
  if (!hasEmailPrimary) warnings.push("No 3P Email Primary assigned.");

  const hasFloat = cycleAssignments.some(
    (assignment) => assignment.columnKey === "FLOAT" && assignment.valueText.trim()
  );
  if (!hasFloat) warnings.push("No Float coverage assigned.");

  return warnings;
};
