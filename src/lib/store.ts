import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Person, Role, initialUsers, initialPersons, initialRoles } from "@/data/mockDb";

interface AppState {
    // Session
    currentUser: User | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    createUser: (user: Omit<User, "id" | "createdAt" | "inviteCode">, creatorId?: string) => void;
    createLeader: (user: Omit<User, "id" | "createdAt" | "inviteCode" | "role" | "password">, creatorId?: string) => void;

    // Data State
    users: User[];
    persons: Person[];
    roles: Role[];

    // Actions
    addRole: (role: Omit<Role, "id" | "createdAt">) => void;
    updateRole: (id: string, role: Partial<Omit<Role, "id" | "createdAt">>) => void;
    deleteRole: (id: string) => void;
    addPerson: (person: Omit<Person, "id" | "createdAt" | "leaderId">, leaderId: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            currentUser: null,
            users: initialUsers,
            persons: initialPersons,
            roles: initialRoles.length > 0 ? initialRoles : [], // Use initialRoles from DB

            login: (email, password) => {
                let success = false;
                set((state) => {
                    const user = state.users.find((u) => u.email === email && u.password === password);
                    if (user) {
                        success = true;
                        return { currentUser: user };
                    }
                    return state;
                });
                return success;
            },

            logout: () => set({ currentUser: null }),

            createUser: (userData, creatorId) =>
                set((state) => {
                    const newUser: User = {
                        ...userData,
                        id: `U${state.users.length + 1}`,
                        // If it's a leader role, we might want an invite code
                        inviteCode: userData.role !== "ADMIN" ? `${userData.name.toUpperCase()}${state.users.length + 1}` : undefined,
                        createdBy: creatorId,
                        createdAt: new Date().toISOString(),
                    };
                    return {
                        users: [...state.users, newUser],
                    };
                }),

            createLeader: (userData, creatorId) =>
                set((state) => {
                    const newUser: User = {
                        ...userData,
                        id: `U${state.users.length + 1}`,
                        role: "Lider de Zona", // Defaulting to one of the new roles
                        password: "leader123",
                        inviteCode: `${userData.name.toUpperCase()}${state.users.length + 1}`,
                        createdBy: creatorId,
                        createdAt: new Date().toISOString(),
                    };
                    return {
                        users: [...state.users, newUser],
                    };
                }),

            addRole: (roleData) =>
                set((state) => ({
                    roles: [
                        ...state.roles,
                        {
                            ...roleData,
                            id: `R${state.roles.length + 1}`,
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })),

            updateRole: (id, roleData) =>
                set((state) => ({
                    roles: state.roles.map((r) => (r.id === id ? { ...r, ...roleData } : r)),
                })),

            deleteRole: (id) =>
                set((state) => ({
                    roles: state.roles.filter((r) => r.id !== id),
                })),

            addPerson: (personData, leaderId) =>
                set((state) => {
                    const newPerson: Person = {
                        ...personData,
                        id: `PER${state.persons.length + 1}`,
                        leaderId,
                        createdAt: new Date().toISOString(),
                    };
                    return {
                        persons: [...state.persons, newPerson],
                    };
                }),
        }),
        {
            name: "accion-comunitaria-storage", // persist data in local storage
        }
    )
);
