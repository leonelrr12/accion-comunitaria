import { z } from "zod";

// Login validation schema
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El correo es requerido")
        .email("Correo electrónico inválido"),
    password: z
        .string()
        .min(1, "La contraseña es requerida")
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Registration validation schema
export const registerSchema = z.object({
    name: z
        .string()
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre es muy largo"),
    lastName: z
        .string()
        .min(1, "El apellido es requerido")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido es muy largo"),
    email: z
        .string()
        .min(1, "El correo es requerido")
        .email("Correo electrónico inválido"),
    password: z
        .string()
        .min(1, "La contraseña es requerida")
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(100, "La contraseña es muy larga"),
    inviteCode: z.string().optional(),
});

// User creation validation schema (admin)
export const createUserSchema = z.object({
    name: z
        .string()
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre es muy largo"),
    lastName: z
        .string()
        .min(1, "El apellido es requerido")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido es muy largo"),
    email: z
        .string()
        .min(1, "El correo es requerido")
        .email("Correo electrónico inválido"),
    password: z
        .string()
        .min(1, "La contraseña es requerida")
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
    roleId: z.number().int().positive("Rol inválido"),
    phone: z.string().optional(),
    provinceId: z.number().int().positive().optional(),
    districtId: z.number().int().positive().optional(),
    corregimientoId: z.number().int().positive().optional(),
    communityId: z.number().int().positive().optional(),
});

// Person (affiliate) creation validation
export const createPersonSchema = z.object({
    name: z
        .string()
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre es muy largo"),
    lastName: z
        .string()
        .min(1, "El apellido es requerido")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido es muy largo"),
    cedula: z
        .string()
        .min(1, "La cédula es requerida")
        .regex(/^\d+$/, "La cédula debe contener solo números"),
    email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
    phone: z
        .string()
        .regex(/^\d+$/, "El teléfono debe contener solo números")
        .optional(),
    provinceId: z.number().int().positive().optional(),
    districtId: z.number().int().positive().optional(),
    corregimientoId: z.number().int().positive().optional(),
    communityId: z.number().int().positive().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreatePersonInput = z.infer<typeof createPersonSchema>;