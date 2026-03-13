import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Person, Role } from "@/types";

interface AppState {
    // Session
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    logout: () => void;
    createUser: (user: Omit<User, "id" | "createdAt" | "inviteCode">, creatorId?: number) => void;
    createLeader: (user: Omit<User, "id" | "createdAt" | "inviteCode" | "role">, creatorId?: number) => void;

    // Data State
    users: User[];
    persons: Person[];
    roles: Role[];

    // Actions
    setUsers: (users: User[]) => void;
    setRoles: (roles: Role[]) => void;
    addRole: (role: Omit<Role, "id" | "createdAt">) => void;
    updateRole: (id: number, role: Partial<Omit<Role, "id" | "createdAt">>) => void;
    deleteRole: (id: number) => void;
    addPerson: (person: Omit<Person, "id" | "createdAt" | "leaderUserId">, leaderUserId: number) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            currentUser: null,
            setCurrentUser: (user: User | null) => set({ currentUser: user }),
            users: [],
            persons: [],
            roles: [],

            setUsers: (users: User[]) => set({ users }),
            setRoles: (roles: Role[]) => set({ roles }),

            logout: () => set({ currentUser: null }),

            createUser: (userData, creatorId) =>
                set((state: AppState) => {
                    const newUser: User = {
                        ...userData,
                        id: state.users.length + 1,
                        inviteCode: userData.role !== "ADMIN" ? `${userData.name.toUpperCase()}${state.users.length + 1}` : undefined,
                        createdBy: creatorId,
                        createdAt: new Date().toISOString(),
                    };
                    return {
                        users: [...state.users, newUser],
                    };
                }),

            createLeader: (userData, creatorId) =>
                set((state: AppState) => {
                    const newUser: User = {
                        ...userData,
                        id: state.users.length + 1,
                        role: "Lider de Zona",
                        inviteCode: `${userData.name.toUpperCase()}${state.users.length + 1}`,
                        createdBy: creatorId,
                        createdAt: new Date().toISOString(),
                    };
                    return {
                        users: [...state.users, newUser],
                    };
                }),

            addRole: (roleData) =>
                set((state: AppState) => ({
                    roles: [
                        ...state.roles,
                        {
                            ...roleData,
                            id: state.roles.length + 1,
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })),

            updateRole: (id, roleData) =>
                set((state: AppState) => ({
                    roles: state.roles.map((r) => (r.id === id ? { ...r, ...roleData } : r)),
                })),

            deleteRole: (id) =>
                set((state: AppState) => ({
                    roles: state.roles.filter((r) => r.id !== id),
                })),

            addPerson: (personData, leaderUserId) =>
                set((state: AppState) => {
                    const newPerson: Person = {
                        ...personData,
                        id: state.persons.length + 1,
                        leaderUserId,
                        createdAt: new Date().toISOString(),
                    };
                    return {
                        persons: [...state.persons, newPerson],
                    };
                }),
        }),
        {
            name: "accion-comunitaria-storage",
        }
    )
);