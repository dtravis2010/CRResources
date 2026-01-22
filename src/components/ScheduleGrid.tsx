import { useEffect, useState } from "react";
import { Assignment, ColumnDefinition, Employee, ScheduleCycle, TimeOff } from "../lib/types";
import { getAssignment, isEmployeeOffInCycle } from "../lib/utils";

const assignmentTypesByValue = (value: string): Assignment["valueType"] => {
  const trimmed = value.trim();
  if (trimmed.toUpperCase() === "X") return "X";
  if (/[A-Z]{2,}/.test(trimmed)) return "ENTITY_LIST";
  if (trimmed.length > 0) return "NOTE";
  return "FREE_TEXT";
};

type Props = {
  cycle: ScheduleCycle;
  employees: Employee[];
  assignments: Assignment[];
  timeOff: TimeOff[];
  highlightEntity: string;
  columnFilter: "all" | "dar" | "incoming" | "cpoe";
  filterPerson: string;
  isSupervisor: boolean;
  onSaveAssignment: (assignment: Assignment) => void;
  onUpdateColumn: (column: ColumnDefinition) => void;
};

type CellInputProps = {
  value: string;
  onSave: (value: string) => void;
};

const CellInput = ({ value, onSave }: CellInputProps) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <input
      className="schedule-input"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onSave(draft)}
    />
  );
};

export const ScheduleGrid = ({
  cycle,
  employees,
  assignments,
  timeOff,
  highlightEntity,
  columnFilter,
  filterPerson,
  isSupervisor,
  onSaveAssignment,
  onUpdateColumn
}: Props) => {
  const visibleColumns = cycle.columnConfig.filter((column) => {
    if (column.key === "TEAM_MEMBER") return true;
    if (columnFilter === "dar") return column.type === "dar";
    if (columnFilter === "incoming") return column.type === "incoming";
    if (columnFilter === "cpoe") return column.key === "CPOE";
    return true;
  });

  const filteredEmployees = employees.filter((employee) =>
    filterPerson ? employee.name.toLowerCase().includes(filterPerson.toLowerCase()) : true
  );

  return (
    <div className="overflow-auto">
      <table className="schedule-grid w-full">
        <thead>
          <tr>
            {visibleColumns.map((column) => (
              <th key={column.key} className={column.key === "TEAM_MEMBER" ? "team-header" : ""}>
                <div className="flex flex-col items-center gap-1">
                  <span>{column.label}</span>
                  {column.key !== "TEAM_MEMBER" && (
                    <div className="subheader">
                      {isSupervisor && (column.type === "dar" || column.type === "incoming") ? (
                        <input
                          className="schedule-input text-xs"
                          value={column.headerGroupText ?? ""}
                          placeholder="Entity group"
                          onChange={(event) =>
                            onUpdateColumn({
                              ...column,
                              headerGroupText: event.target.value
                            })
                          }
                        />
                      ) : (
                        <span>{column.headerGroupText}</span>
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => {
            const off = isEmployeeOffInCycle(employee, cycle, timeOff);

            return (
              <tr key={employee.id} className={off ? "off-row" : ""}>
                {visibleColumns.map((column) => {
                  if (column.key === "TEAM_MEMBER") {
                    return (
                      <th key={`${employee.id}-${column.key}`} className="name-cell">
                        <div className="flex flex-col">
                          <span>{employee.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {employee.roleLevel} · {employee.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </th>
                    );
                  }

                  const assignment = getAssignment(assignments, cycle.id, employee.id, column.key);
                  const valueText = assignment?.valueText ?? "";
                  const highlighted =
                    highlightEntity && valueText.toUpperCase().includes(highlightEntity.toUpperCase());

                  return (
                    <td
                      key={`${employee.id}-${column.key}`}
                      className={highlighted ? "highlight-cell" : ""}
                    >
                      {isSupervisor ? (
                        <CellInput
                          value={valueText}
                          onSave={(nextValue) =>
                            onSaveAssignment({
                              id: assignment?.id ?? "",
                              scheduleCycleId: cycle.id,
                              employeeId: employee.id,
                              columnKey: column.key,
                              valueText: nextValue,
                              valueType: assignmentTypesByValue(nextValue)
                            })
                          }
                        />
                      ) : (
                        <span>{valueText}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
