import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, createUserSchema, createPersonSchema } from './validation'

describe('Login Validation', () => {
    it('should validate correct login input', () => {
        const result = loginSchema.safeParse({
            email: 'test@example.com',
            password: 'password123',
        })
        expect(result.success).toBe(true)
    })

    it('should reject empty email', () => {
        const result = loginSchema.safeParse({
            email: '',
            password: 'password123',
        })
        expect(result.success).toBe(false)
    })

    it('should reject invalid email format', () => {
        const result = loginSchema.safeParse({
            email: 'not-an-email',
            password: 'password123',
        })
        expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
        const result = loginSchema.safeParse({
            email: 'test@example.com',
            password: '12345',
        })
        expect(result.success).toBe(false)
    })
})

describe('Register Validation', () => {
    it('should validate correct registration', () => {
        const result = registerSchema.safeParse({
            name: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
        })
        expect(result.success).toBe(true)
    })

    it('should reject short name', () => {
        const result = registerSchema.safeParse({
            name: 'J',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
        })
        expect(result.success).toBe(false)
    })

    it('should accept optional invite code', () => {
        const result = registerSchema.safeParse({
            name: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            inviteCode: 'ABC123',
        })
        expect(result.success).toBe(true)
    })
})

describe('Create User Validation', () => {
    it('should validate user creation input', () => {
        const result = createUserSchema.safeParse({
            name: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            password: 'password123',
            roleId: 1,
        })
        expect(result.success).toBe(true)
    })

    it('should validate optional phone', () => {
        const result = createUserSchema.safeParse({
            name: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            password: 'password123',
            roleId: 1,
            phone: '1234567890',
        })
        expect(result.success).toBe(true)
    })

    it('should reject negative roleId', () => {
        const result = createUserSchema.safeParse({
            name: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            password: 'password123',
            roleId: -1,
        })
        expect(result.success).toBe(false)
    })
})

describe('Create Person Validation', () => {
    it('should validate person with all fields', () => {
        const result = createPersonSchema.safeParse({
            name: 'John',
            lastName: 'Doe',
            cedula: '12345678',
            email: 'john@example.com',
            phone: '9876543210',
            provinceId: 1,
            districtId: 1,
            corregimientoId: 1,
            communityId: 1,
        })
        expect(result.success).toBe(true)
    })

    it('should validate person with minimal fields', () => {
        const result = createPersonSchema.safeParse({
            name: 'John',
            lastName: 'Doe',
            cedula: '12345678',
        })
        expect(result.success).toBe(true)
    })

    it('should reject non-numeric cedula', () => {
        const result = createPersonSchema.safeParse({
            name: 'John',
            lastName: 'Doe',
            cedula: '1234abcd',
        })
        expect(result.success).toBe(false)
    })

    it('should reject invalid email', () => {
        const result = createPersonSchema.safeParse({
            name: 'John',
            lastName: 'Doe',
            cedula: '12345678',
            email: 'invalid-email',
        })
        expect(result.success).toBe(false)
    })
})