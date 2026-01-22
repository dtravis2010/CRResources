import { useEffect, useMemo, useState } from "react";
import { ScheduleGrid } from "./components/ScheduleGrid";
import { useDataStore } from "./lib/dataStore";
import {
  Assignment,
  ColumnDefinition,
  Employee,
  Entity,
  Productivity,
  ScheduleCycle,
  TimeOff
} from "./lib/types";
import { buildCoverageWarnings, formatDateRange } from "./lib/utils";

const supervisorPassword = "1234";

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}`;
};

const defaultColumns = (darCount: number, incomingCount: number): ColumnDefinition[] => {
  const columns: ColumnDefinition[] = [
    { key: "TEAM_MEMBER", label: "TEAM MEMBER", type: "single" }
  ];

  for (let i = 1; i <= darCount; i += 1) {
    columns.push({
      key: `DAR_${i}`,
      label: `DAR ${i}`,
      type: "dar",
      headerGroupText: ""
    });
  }

  columns.push({ key: "CPOE", label: "CPOE", type: "single" });

  for (let i = 1; i <= incomingCount; i += 1) {
    columns.push({
      key: `INCOMING_${i}`,
      label: incomingCount > 1 ? `Incoming ${i}` : "New Incoming Items",
      type: "incoming",
      headerGroupText: ""
    });
  }

  columns.push(
    { key: "CROSS_TRAINING", label: "Cross-Training", type: "freeText" },
    { key: "SPECIAL_PROJECTS", label: "Special Projects/Assignments", type: "freeText" },
    { key: "EMAIL_PRIMARY", label: "3P Email (Primary)", type: "single" },
    { key: "EMAIL_BACKUP", label: "3P Email (Backup)", type: "single" },
    { key: "FLOAT", label: "Float", type: "single" }
  );

  return columns;
};

const emptyEmployee: Employee = {
  id: "",
  name: "",
  roleLevel: "CR I",
  active: true,
  training: { incomingTrained: false, darTrained: false, cpoeTrained: false }
};

const emptyEntity: Entity = { id: "", code: "", displayName: "" };

const emptyTimeOff: TimeOff = {
  id: "",
  employeeId: "",
  startDate: "",
  endDate: "",
  type: "PTO"
};

const emptyProductivity: Productivity = {
  id: "",
  scheduleCycleId: "",
  entityCode: "",
  darCount: 0,
  incomingCount: 0,
  cpoeCount: 0
};

const emptyScheduleCycle: ScheduleCycle = {
  id: "",
  title: "",
  startDate: "",
  endDate: "",
  effectiveDate: "",
  status: "draft",
  columnConfig: defaultColumns(5, 1)
};

const buildHistory = (assignments: Assignment[]) => {
  const byPerson: Record<string, Set<string>> = {};
  const byEntity: Record<string, Set<string>> = {};

  assignments.forEach((assignment) => {
    if (!assignment.entityCodes) return;
    assignment.entityCodes.forEach((code) => {
      if (!byPerson[assignment.employeeId]) {
        byPerson[assignment.employeeId] = new Set();
      }
      byPerson[assignment.employeeId].add(code);

      if (!byEntity[code]) {
        byEntity[code] = new Set();
      }
      byEntity[code].add(assignment.employeeId);
    });
  });

  return { byPerson, byEntity };
};

function App() {
  const { data, loaded, actions } = useDataStore();
  const [activeCycleId, setActiveCycleId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"user" | "supervisor">("user");
  const [passwordAttempt, setPasswordAttempt] = useState("");
  const [filterPerson, setFilterPerson] = useState("");
  const [highlightEntity, setHighlightEntity] = useState("");
  const [columnFilter, setColumnFilter] = useState<"all" | "dar" | "incoming" | "cpoe">(
    "all"
  );
  const [employeeForm, setEmployeeForm] = useState<Employee>(emptyEmployee);
  const [entityForm, setEntityForm] = useState<Entity>(emptyEntity);
  const [cycleForm, setCycleForm] = useState<ScheduleCycle>(emptyScheduleCycle);
  const [timeOffForm, setTimeOffForm] = useState<TimeOff>(emptyTimeOff);
  const [productivityForm, setProductivityForm] = useState<Productivity>(emptyProductivity);

  const moveColumn = (index: number, direction: "up" | "down") => {
    setCycleForm((prev) => {
      const nextConfig = [...prev.columnConfig];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextConfig.length) {
        return prev;
      }
      const [moved] = nextConfig.splice(index, 1);
      nextConfig.splice(targetIndex, 0, moved);
      return { ...prev, columnConfig: nextConfig };
    });
  };

  useEffect(() => {
    actions.reload();
  }, [actions]);

  useEffect(() => {
    if (!loaded) return;

    const published = data.scheduleCycles.find((cycle) => cycle.status === "published");
    const fallback = data.scheduleCycles[0];
    const active = published ?? fallback;
    if (active) {
      setActiveCycleId(active.id);
    }
  }, [loaded, data.scheduleCycles]);

  const activeCycle = data.scheduleCycles.find((cycle) => cycle.id === activeCycleId);
  const coverageWarnings = activeCycle
    ? buildCoverageWarnings(activeCycle, data.assignments)
    : [];

  const history = useMemo(() => buildHistory(data.assignments), [data.assignments]);

  const isSupervisor = viewMode === "supervisor";

  const handlePasswordSubmit = () => {
    if (passwordAttempt === supervisorPassword) {
      setViewMode("supervisor");
    }
  };

  const handleUpdateColumn = (column: ColumnDefinition) => {
    if (!activeCycle) return;
    const nextCycle: ScheduleCycle = {
      ...activeCycle,
      columnConfig: activeCycle.columnConfig.map((item) =>
        item.key === column.key ? column : item
      )
    };
    actions.saveScheduleCycle(nextCycle);
  };

  const handleCycleTemplate = () => {
    if (!activeCycle) return;

    const newCycleId = generateId();
    const newCycle: ScheduleCycle = {
      ...activeCycle,
      id: newCycleId,
      title: `${activeCycle.title} (Copy)`,
      status: "draft"
    };

    actions.saveScheduleCycle(newCycle);

    const nextAssignments = data.assignments
      .filter((assignment) => assignment.scheduleCycleId === activeCycle.id)
      .map((assignment) => ({
        ...assignment,
        id: generateId(),
        scheduleCycleId: newCycleId
      }));

    nextAssignments.forEach((assignment) => actions.saveAssignment(assignment));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 no-print">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Clinical Review</p>
            <h1 className="text-2xl font-semibold text-slate-900">Scheduling Control Center</h1>
            <p className="text-sm text-slate-600">
              Data mode: <span className="font-semibold">{actions.mode}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {viewMode === "user" ? (
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Supervisor password"
                  value={passwordAttempt}
                  onChange={(event) => setPasswordAttempt(event.target.value)}
                />
                <button
                  className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                  onClick={handlePasswordSubmit}
                >
                  Enter Supervisor
                </button>
              </div>
            ) : (
              <button
                className="rounded border border-slate-200 px-3 py-2 text-sm"
                onClick={() => setViewMode("user")}
              >
                Exit Supervisor
              </button>
            )}
            <button
              className="rounded border border-slate-200 px-3 py-2 text-sm"
              onClick={() => window.print()}
            >
              Print View
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-6">
        {activeCycle ? (
          <section className="section-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="print-title text-xl font-semibold text-slate-900">
                  {activeCycle.title} ({formatDateRange(activeCycle.startDate, activeCycle.endDate)})
                </h2>
                <p className="text-sm text-slate-500">Effective {activeCycle.effectiveDate}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                  value={activeCycleId}
                  onChange={(event) => setActiveCycleId(event.target.value)}
                >
                  {data.scheduleCycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.title} · {cycle.status}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                  value={columnFilter}
                  onChange={(event) =>
                    setColumnFilter(event.target.value as "all" | "dar" | "incoming" | "cpoe")
                  }
                >
                  <option value="all">Show all</option>
                  <option value="dar">DAR only</option>
                  <option value="incoming">Incoming only</option>
                  <option value="cpoe">CPOE only</option>
                </select>
                <input
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Filter by person"
                  value={filterPerson}
                  onChange={(event) => setFilterPerson(event.target.value)}
                />
                <input
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Highlight entity (ex: THP)"
                  value={highlightEntity}
                  onChange={(event) => setHighlightEntity(event.target.value)}
                />
              </div>
            </div>
            {coverageWarnings.length > 0 && (
              <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-semibold">Coverage warnings</p>
                <ul className="list-disc pl-5">
                  {coverageWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4">
              <ScheduleGrid
                cycle={activeCycle}
                employees={data.employees}
                assignments={data.assignments}
                timeOff={data.timeOff}
                highlightEntity={highlightEntity}
                columnFilter={columnFilter}
                filterPerson={filterPerson}
                isSupervisor={isSupervisor}
                onSaveAssignment={actions.saveAssignment}
                onUpdateColumn={handleUpdateColumn}
              />
            </div>
          </section>
        ) : (
          <section className="section-card">
            <p>No schedule cycles yet. Create one in Supervisor mode.</p>
          </section>
        )}

        {isSupervisor && (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="section-card">
                <h3 className="text-lg font-semibold">Schedule Cycles</h3>
                <div className="mt-3 grid gap-3">
                  {data.scheduleCycles.map((cycle) => (
                    <div key={cycle.id} className="rounded border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{cycle.title}</p>
                          <p className="text-xs text-slate-500">
                            {cycle.status} · {cycle.startDate} → {cycle.endDate}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="rounded border border-slate-200 px-2 py-1 text-xs"
                            onClick={() => setCycleForm(cycle)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded border border-slate-200 px-2 py-1 text-xs"
                            onClick={() => actions.removeItem("scheduleCycles", cycle.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                    onClick={handleCycleTemplate}
                  >
                    Copy active cycle
                  </button>
                </div>
              </div>

              <div className="section-card">
                <h3 className="text-lg font-semibold">Edit Cycle</h3>
                <div className="mt-3 grid gap-3">
                  <input
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Title"
                    value={cycleForm.title}
                    onChange={(event) => setCycleForm({ ...cycleForm, title: event.target.value })}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="date"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      value={cycleForm.startDate}
                      onChange={(event) =>
                        setCycleForm({ ...cycleForm, startDate: event.target.value })
                      }
                    />
                    <input
                      type="date"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      value={cycleForm.endDate}
                      onChange={(event) =>
                        setCycleForm({ ...cycleForm, endDate: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="date"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      value={cycleForm.effectiveDate}
                      onChange={(event) =>
                        setCycleForm({ ...cycleForm, effectiveDate: event.target.value })
                      }
                    />
                    <select
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      value={cycleForm.status}
                      onChange={(event) =>
                        setCycleForm({
                          ...cycleForm,
                          status: event.target.value as ScheduleCycle["status"]
                        })
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="number"
                      min={1}
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="DAR columns"
                      value={cycleForm.columnConfig.filter((column) => column.type === "dar").length}
                      onChange={(event) =>
                        setCycleForm({
                          ...cycleForm,
                          columnConfig: defaultColumns(
                            Number(event.target.value),
                            cycleForm.columnConfig.filter((column) => column.type === "incoming")
                              .length
                          )
                        })
                      }
                    />
                    <input
                      type="number"
                      min={1}
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Incoming columns"
                      value={
                        cycleForm.columnConfig.filter((column) => column.type === "incoming")
                          .length
                      }
                      onChange={(event) =>
                        setCycleForm({
                          ...cycleForm,
                          columnConfig: defaultColumns(
                            cycleForm.columnConfig.filter((column) => column.type === "dar").length,
                            Number(event.target.value)
                          )
                        })
                      }
                    />
                  </div>
                  <div className="rounded border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-700">Column order</p>
                    <div className="mt-2 grid gap-2">
                      {cycleForm.columnConfig.map((column, index) => (
                        <div
                          key={column.key}
                          className="flex items-center justify-between rounded border border-slate-100 px-2 py-1 text-xs"
                        >
                          <div>
                            <span className="font-semibold">{column.label}</span>
                            <span className="ml-2 text-slate-500">{column.type}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="rounded border border-slate-200 px-2 py-1"
                              onClick={() => moveColumn(index, "up")}
                            >
                              ↑
                            </button>
                            <button
                              className="rounded border border-slate-200 px-2 py-1"
                              onClick={() => moveColumn(index, "down")}
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Notes"
                    value={cycleForm.notes ?? ""}
                    onChange={(event) => setCycleForm({ ...cycleForm, notes: event.target.value })}
                  />
                  <button
                    className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                    onClick={() => actions.saveScheduleCycle(cycleForm)}
                  >
                    Save cycle
                  </button>
                </div>
              </div>

              <div className="section-card">
                <h3 className="text-lg font-semibold">Employees</h3>
                <div className="mt-3 grid gap-2">
                  {data.employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{employee.name}</p>
                        <p className="text-xs text-slate-500">
                          {employee.roleLevel} · {employee.active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                          onClick={() => setEmployeeForm(employee)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                          onClick={() => actions.removeItem("employees", employee.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2">
                  <input
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Name"
                    value={employeeForm.name}
                    onChange={(event) => setEmployeeForm({ ...employeeForm, name: event.target.value })}
                  />
                  <select
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    value={employeeForm.roleLevel}
                    onChange={(event) =>
                      setEmployeeForm({
                        ...employeeForm,
                        roleLevel: event.target.value as Employee["roleLevel"]
                      })
                    }
                  >
                    <option value="CR I">CR I</option>
                    <option value="CR II">CR II</option>
                  </select>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={employeeForm.active}
                        onChange={(event) =>
                          setEmployeeForm({ ...employeeForm, active: event.target.checked })
                        }
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={employeeForm.training.incomingTrained}
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            training: {
                              ...employeeForm.training,
                              incomingTrained: event.target.checked
                            }
                          })
                        }
                      />
                      Incoming trained
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={employeeForm.training.darTrained}
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            training: { ...employeeForm.training, darTrained: event.target.checked }
                          })
                        }
                      />
                      DAR trained
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={employeeForm.training.cpoeTrained}
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            training: { ...employeeForm.training, cpoeTrained: event.target.checked }
                          })
                        }
                      />
                      CPOE trained
                    </label>
                  </div>
                  <button
                    className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                    onClick={() => actions.saveEmployee(employeeForm)}
                  >
                    Save employee
                  </button>
                </div>
              </div>

              <div className="section-card">
                <h3 className="text-lg font-semibold">Entities</h3>
                <div className="mt-3 grid gap-2">
                  {data.entities.map((entity) => (
                    <div key={entity.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{entity.code}</p>
                        <p className="text-xs text-slate-500">{entity.displayName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                          onClick={() => setEntityForm(entity)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                          onClick={() => actions.removeItem("entities", entity.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2">
                  <input
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Code"
                    value={entityForm.code}
                    onChange={(event) => setEntityForm({ ...entityForm, code: event.target.value })}
                  />
                  <input
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Display name"
                    value={entityForm.displayName}
                    onChange={(event) =>
                      setEntityForm({ ...entityForm, displayName: event.target.value })
                    }
                  />
                  <button
                    className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                    onClick={() => actions.saveEntity(entityForm)}
                  >
                    Save entity
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="section-card">
                <h3 className="text-lg font-semibold">Time Off</h3>
                <div className="mt-3 grid gap-2">
                  {data.timeOff.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {data.employees.find((employee) => employee.id === entry.employeeId)
                            ?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {entry.startDate} → {entry.endDate} · {entry.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                          onClick={() => setTimeOffForm(entry)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                          onClick={() => actions.removeItem("timeOff", entry.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2">
                  <select
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    value={timeOffForm.employeeId}
                    onChange={(event) =>
                      setTimeOffForm({ ...timeOffForm, employeeId: event.target.value })
                    }
                  >
                    <option value="">Select employee</option>
                    {data.employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      type="date"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      value={timeOffForm.startDate}
                      onChange={(event) =>
                        setTimeOffForm({ ...timeOffForm, startDate: event.target.value })
                      }
                    />
                    <input
                      type="date"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      value={timeOffForm.endDate}
                      onChange={(event) =>
                        setTimeOffForm({ ...timeOffForm, endDate: event.target.value })
                      }
                    />
                  </div>
                  <input
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Type (PTO, Holiday)"
                    value={timeOffForm.type}
                    onChange={(event) => setTimeOffForm({ ...timeOffForm, type: event.target.value })}
                  />
                  <input
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Note"
                    value={timeOffForm.note ?? ""}
                    onChange={(event) => setTimeOffForm({ ...timeOffForm, note: event.target.value })}
                  />
                  <button
                    className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                    onClick={() => actions.saveTimeOff(timeOffForm)}
                  >
                    Save time off
                  </button>
                </div>
              </div>

              <div className="section-card">
                <h3 className="text-lg font-semibold">Productivity (Counts)</h3>
                <div className="mt-3 grid gap-2">
                  {data.productivity.map((entry) => (
                    <div key={entry.id} className="rounded border border-slate-200 p-3 text-sm">
                      <p className="font-semibold">{entry.entityCode}</p>
                      <p className="text-xs text-slate-500">
                        Cycle: {data.scheduleCycles.find((cycle) => cycle.id === entry.scheduleCycleId)
                          ?.title ?? ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        DAR: {entry.darCount} · Incoming: {entry.incomingCount} · CPOE:{" "}
                        {entry.cpoeCount ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2">
                  <select
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    value={productivityForm.scheduleCycleId}
                    onChange={(event) =>
                      setProductivityForm({
                        ...productivityForm,
                        scheduleCycleId: event.target.value
                      })
                    }
                  >
                    <option value="">Select cycle</option>
                    {data.scheduleCycles.map((cycle) => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.title}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    value={productivityForm.entityCode}
                    onChange={(event) =>
                      setProductivityForm({
                        ...productivityForm,
                        entityCode: event.target.value
                      })
                    }
                  >
                    <option value="">Select entity</option>
                    {data.entities.map((entity) => (
                      <option key={entity.id} value={entity.code}>
                        {entity.code}
                      </option>
                    ))}
                  </select>
                  <div className="grid gap-2 md:grid-cols-3">
                    <input
                      type="number"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="DAR count"
                      value={productivityForm.darCount}
                      onChange={(event) =>
                        setProductivityForm({
                          ...productivityForm,
                          darCount: Number(event.target.value)
                        })
                      }
                    />
                    <input
                      type="number"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Incoming count"
                      value={productivityForm.incomingCount}
                      onChange={(event) =>
                        setProductivityForm({
                          ...productivityForm,
                          incomingCount: Number(event.target.value)
                        })
                      }
                    />
                    <input
                      type="number"
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="CPOE count"
                      value={productivityForm.cpoeCount ?? 0}
                      onChange={(event) =>
                        setProductivityForm({
                          ...productivityForm,
                          cpoeCount: Number(event.target.value)
                        })
                      }
                    />
                  </div>
                  <button
                    className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                    onClick={() => actions.saveProductivity(productivityForm)}
                  >
                    Save productivity
                  </button>
                </div>
              </div>

              <div className="section-card">
                <h3 className="text-lg font-semibold">History Tracker</h3>
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-slate-700">By person</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    {data.employees.map((employee) => (
                      <div key={employee.id}>
                        <span className="font-semibold">{employee.name}:</span>{" "}
                        {Array.from(history.byPerson[employee.id] ?? []).join(", ") ||
                          "No entities yet"}
                      </div>
                    ))}
                  </div>
                  <h4 className="mt-4 text-sm font-semibold text-slate-700">By entity</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    {data.entities.map((entity) => (
                      <div key={entity.id}>
                        <span className="font-semibold">{entity.code}:</span>{" "}
                        {Array.from(history.byEntity[entity.code] ?? [])
                          .map(
                            (employeeId) =>
                              data.employees.find((employee) => employee.id === employeeId)?.name ??
                              employeeId
                          )
                          .join(", ") || "No coverage yet"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {!isSupervisor && (
          <section className="section-card">
            <h3 className="text-lg font-semibold">Published Schedule Notes</h3>
            <p className="text-sm text-slate-600">
              {activeCycle?.notes || "No notes for this cycle."}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
