// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { isCustomForceBlockTranslation } from '../filter'

function setHost(host: string) {
  // jsdom exposes location as read-only; override via defineProperty
  Object.defineProperty(window, 'location', {
    value: new URL(`https://${host}/some/path`),
    writable: true,
  })
}

describe('isCustomForceBlockTranslation', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('matches child element inside configured parent on github.com', () => {
    setHost('github.com')

    const commitCell = document.createElement('div')
    commitCell.classList.add('react-directory-row-commit-cell')
    const child = document.createElement('span')
    commitCell.appendChild(child)
    document.body.appendChild(commitCell)

    // Child matches `.react-directory-row-commit-cell *`
    expect(isCustomForceBlockTranslation(child)).toBe(true)
    // Parent itself does not match (selector is `* ` for descendants)
    expect(isCustomForceBlockTranslation(commitCell)).toBe(false)
  })

  it('does not match on non-configured host', () => {
    setHost('example.com')

    const commitCell = document.createElement('div')
    commitCell.classList.add('react-directory-row-commit-cell')
    const child = document.createElement('span')
    commitCell.appendChild(child)
    document.body.appendChild(commitCell)

    expect(isCustomForceBlockTranslation(child)).toBe(false)
  })

  it('does not match element outside configured parent on configured host', () => {
    setHost('github.com')

    const other = document.createElement('div')
    document.body.appendChild(other)

    expect(isCustomForceBlockTranslation(other)).toBe(false)
  })

  it('uses hostname when host includes port', () => {
    setHost('github.com:3000')

    const commitCell = document.createElement('div')
    commitCell.classList.add('react-directory-row-commit-cell')
    const child = document.createElement('span')
    commitCell.appendChild(child)
    document.body.appendChild(commitCell)

    expect(window.location.host).toContain(':')
    expect(window.location.hostname).toBe('github.com')

    expect(isCustomForceBlockTranslation(child)).toBe(true)
  })

  it('does not match on non-configured host when host !== hostname', () => {
    setHost('example.com:8080')

    const commitCell = document.createElement('div')
    commitCell.classList.add('react-directory-row-commit-cell')
    const child = document.createElement('span')
    commitCell.appendChild(child)
    document.body.appendChild(commitCell)

    expect(window.location.host).toContain(':')
    expect(window.location.hostname).toBe('example.com')

    expect(isCustomForceBlockTranslation(child)).toBe(false)
  })
})
