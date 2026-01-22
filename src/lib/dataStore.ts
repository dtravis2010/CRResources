import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc
} from "firebase/firestore";
import { useCallback, useMemo, useState } from "react";
import { seedData } from "../data/seed";
import { firestoreDb, firebaseEnabled } from "./firebase";
import {
  Assignment,
  DataState,
  Employee,
  Entity,
  Productivity,
  ScheduleCycle,
  TimeOff
} from "./types";

const emptyState: DataState = {
  employees: [],
  entities: [],
  scheduleCycles: [],
  assignments: [],
  timeOff: [],
  productivity: []
};

const collectionMap: Record<keyof DataState, string> = {
  employees: "employees",
  entities: "entities",
  scheduleCycles: "scheduleCycles",
  assignments: "assignments",
  timeOff: "timeOff",
  productivity: "productivity"
};

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}`;
};

const parseEntityCodes = (valueText: string, entities: Entity[]) => {
  const candidates = valueText.match(/[A-Z]{2,5}/g) ?? [];
  const known = new Set(entities.map((entity) => entity.code));
  return Array.from(new Set(candidates.filter((code) => known.has(code))));
};

export const useDataStore = () => {
  const [data, setData] = useState<DataState>(seedData);
  const [loaded, setLoaded] = useState(false);
  const mode = firebaseEnabled ? "firestore" : "local";

  const load = useCallback(async () => {
    if (!firebaseEnabled || !firestoreDb) {
      setLoaded(true);
      return;
    }

    const entries = (await Promise.all(
      (Object.keys(collectionMap) as (keyof DataState)[]).map(async (key) => {
        const snapshot = await getDocs(collection(firestoreDb, collectionMap[key]));
        return [
          key,
          snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        ] as const;
      })
    )) as [keyof DataState, unknown[]][];

    const nextState = entries.reduce((acc, [key, value]) => {
      acc[key] = value as never;
      return acc;
    }, { ...emptyState });

    setData(nextState);
    setLoaded(true);
  }, []);

  const updateCollection = useCallback(
    async <T extends { id: string }>(key: keyof DataState, items: T[]) => {
      setData((prev) => ({ ...prev, [key]: items }));

      if (!firebaseEnabled || !firestoreDb) {
        return;
      }

      await Promise.all(
        items.map((item) =>
          setDoc(doc(firestoreDb, collectionMap[key], item.id), item, { merge: true })
        )
      );
    },
    []
  );

  const removeItem = useCallback(async (key: keyof DataState, id: string) => {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => (item as { id: string }).id !== id)
    }));

    if (!firebaseEnabled || !firestoreDb) {
      return;
    }

    await deleteDoc(doc(firestoreDb, collectionMap[key], id));
  }, []);

  const saveEmployee = useCallback(
    async (employee: Employee) => {
      const id = employee.id || generateId();
      const updated = { ...employee, id };
      await updateCollection("employees", [
        ...data.employees.filter((item) => item.id !== id),
        updated
      ]);
    },
    [data.employees, updateCollection]
  );

  const saveEntity = useCallback(
    async (entity: Entity) => {
      const id = entity.id || generateId();
      const updated = { ...entity, id };
      await updateCollection("entities", [
        ...data.entities.filter((item) => item.id !== id),
        updated
      ]);
    },
    [data.entities, updateCollection]
  );

  const saveScheduleCycle = useCallback(
    async (cycle: ScheduleCycle) => {
      const id = cycle.id || generateId();
      const updated = { ...cycle, id };
      await updateCollection("scheduleCycles", [
        ...data.scheduleCycles.filter((item) => item.id !== id),
        updated
      ]);
    },
    [data.scheduleCycles, updateCollection]
  );

  const saveAssignment = useCallback(
    async (assignment: Assignment) => {
      const id = assignment.id || generateId();
      const entityCodes = parseEntityCodes(assignment.valueText, data.entities);
      const updated = { ...assignment, id, entityCodes };
      await updateCollection("assignments", [
        ...data.assignments.filter((item) => item.id !== id),
        updated
      ]);
    },
    [data.assignments, data.entities, updateCollection]
  );

  const saveTimeOff = useCallback(
    async (entry: TimeOff) => {
      const id = entry.id || generateId();
      const updated = { ...entry, id };
      await updateCollection("timeOff", [
        ...data.timeOff.filter((item) => item.id !== id),
        updated
      ]);
    },
    [data.timeOff, updateCollection]
  );

  const saveProductivity = useCallback(
    async (entry: Productivity) => {
      const id = entry.id || generateId();
      const updated = { ...entry, id };
      await updateCollection("productivity", [
        ...data.productivity.filter((item) => item.id !== id),
        updated
      ]);
    },
    [data.productivity, updateCollection]
  );

  const actions = useMemo(
    () => ({
      saveEmployee,
      saveEntity,
      saveScheduleCycle,
      saveAssignment,
      saveTimeOff,
      saveProductivity,
      removeItem,
      reload: load,
      mode
    }),
    [
      saveEmployee,
      saveEntity,
      saveScheduleCycle,
      saveAssignment,
      saveTimeOff,
      saveProductivity,
      removeItem,
      load,
      mode
    ]
  );

  return { data, setData, loaded, actions };
};
