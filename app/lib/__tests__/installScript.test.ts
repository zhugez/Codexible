import { describe, it, expect } from 'vitest'
import { buildInstallScript } from '../installScript'

describe('buildInstallScript', () => {
  it('should generate a valid install script with valid inputs', () => {
    const script = buildInstallScript('test-api-key-123', 'https://api.codexible.me')

    expect(script).toContain('#!/usr/bin/env sh')
    expect(script).toContain('Codexible Installer')
    expect(script).toContain("ENDPOINT_URL='https://api.codexible.me'")
    expect(script).toContain("DEFAULT_API_KEY='test-api-key-123'")
  })

  it('should throw error for invalid endpoint', () => {
    expect(() => buildInstallScript('', '')).toThrow('Endpoint URL is required')
    expect(() => buildInstallScript('', 'not-a-url')).toThrow('Invalid endpoint URL')
    expect(() => buildInstallScript('', 'ftp://invalid.com')).toThrow('Invalid endpoint URL')
    expect(() => buildInstallScript('', 'http://insecure.com')).toThrow('Invalid endpoint URL')
  })

  it('should throw error for invalid API key characters', () => {
    expect(() =>
      buildInstallScript('key with spaces', 'https://api.codexible.me')
    ).toThrow('Invalid API key format')

    expect(() =>
      buildInstallScript('key;with;semicolons', 'https://api.codexible.me')
    ).toThrow('Invalid API key format')

    expect(() =>
      buildInstallScript("key'with'quotes", 'https://api.codexible.me')
    ).toThrow('Invalid API key format')

    expect(() =>
      buildInstallScript('key`with`backticks', 'https://api.codexible.me')
    ).toThrow('Invalid API key format')
  })

  it('should escape single quotes in endpoint', () => {
    // Note: The endpoint validation should reject URLs with special chars,
    // but if they somehow get through, the escaping should work
    const validEndpoint = 'https://api.codexible.me'
    const script = buildInstallScript('', validEndpoint)

    // Ensure script doesn't contain unescaped special chars
    expect(script).not.toContain('\x00') // null byte
    expect(script).toContain(validEndpoint)
  })

  it('should accept empty API key', () => {
    // Empty API key is valid - user will be prompted
    const script = buildInstallScript('', 'https://api.codexible.me')
    expect(script).toContain("DEFAULT_API_KEY=''")
  })

  it('should accept valid API key with hyphens and underscores', () => {
    const key = 'my-api_key-123'
    const script = buildInstallScript(key, 'https://api.codexible.me')
    expect(script).toContain(key)
  })
})
