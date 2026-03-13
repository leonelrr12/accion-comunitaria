import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'

describe('Password hashing with bcryptjs', () => {
    const testPassword = 'miPassword123'

    it('should hash a password correctly', async () => {
        const hash = await bcrypt.hash(testPassword, 12)
        expect(hash).not.toBe(testPassword)
        expect(hash.startsWith('$2')).toBe(true)
    })

    it('should verify correct password', async () => {
        const hash = await bcrypt.hash(testPassword, 12)
        const isValid = await bcrypt.compare(testPassword, hash)
        expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
        const hash = await bcrypt.hash(testPassword, 12)
        const isValid = await bcrypt.compare('wrongPassword', hash)
        expect(isValid).toBe(false)
    })

    it('should handle legacy plaintext comparison', () => {
        // Simulating legacy plaintext password stored in DB
        const legacyPassword: string = 'plainPassword123'
        const isPlainTextMatch = legacyPassword === 'plainPassword123'
        expect(isPlainTextMatch).toBe(true)

        const wrongPassword: string = 'differentPassword'
        const nonMatch = legacyPassword === wrongPassword
        expect(nonMatch).toBe(false)
    })

    it('should detect bcrypt hash format', () => {
        const bcryptHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8Vhcm9nKG'
        const plainText = 'somePassword123'

        const isBcrypt = bcryptHash.startsWith('$2')
        expect(isBcrypt).toBe(true)

        const isNotBcrypt = !plainText.startsWith('$2')
        expect(isNotBcrypt).toBe(true)
    })
})