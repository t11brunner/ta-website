// Parse a polynomial in s typed by a student: "s^2 + 2s + 2", "(s+1)^3",
// "4(s + 0.5)(s - 1)", "0,5s + 1". Supports + − * / ^, brackets, implicit
// multiplication and decimal commas. Division only by constants.
import type { Poly } from './math'

/** Coefficients lowest power first while parsing. */
type P = number[]

const trim = (p: P) => {
  const q = [...p]
  while (q.length > 1 && Math.abs(q[q.length - 1]) < 1e-12) q.pop()
  return q
}
const add = (a: P, b: P, sign = 1) => trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) + sign * (b[i] ?? 0)))
const mul = (a: P, b: P) => {
  const r = new Array(a.length + b.length - 1).fill(0)
  a.forEach((x, i) => b.forEach((y, j) => (r[i + j] += x * y)))
  return trim(r)
}
const isConst = (p: P) => trim(p).length === 1

export class ParseError extends Error {}

export function parsePoly(src: string, maxDeg = 8): Poly {
  const s = src.replace(/[·×]/g, '*').replace(/−/g, '-').replace(/(\d),(\d)/g, '$1.$2')
  let i = 0
  const ws = () => {
    while (i < s.length && /\s/.test(s[i])) i++
  }
  const peek = () => {
    ws()
    return s[i]
  }
  const fail = (msg: string): never => {
    throw new ParseError(msg)
  }

  const expr = (): P => {
    let r = term()
    for (;;) {
      const c = peek()
      if (c === '+' || c === '-') {
        i++
        r = add(r, term(), c === '+' ? 1 : -1)
      } else return r
    }
  }
  const term = (): P => {
    let r = unary()
    for (;;) {
      const c = peek()
      if (c === '*') {
        i++
        r = mul(r, unary())
      } else if (c === '/') {
        i++
        const d = unary()
        if (!isConst(d) || Math.abs(d[0]) < 1e-12) fail('You can only divide by a non-zero number here. Put the fraction into the two fields instead.')
        r = r.map((x) => x / d[0])
      } else if (c !== undefined && /[0-9.s(]/.test(c)) r = mul(r, unary()) // implicit: 2s, (s+1)(s+2)
      else return r
    }
  }
  const unary = (): P => {
    const c = peek()
    if (c === '-') {
      i++
      return unary().map((x) => -x)
    }
    if (c === '+') {
      i++
      return unary()
    }
    return power()
  }
  const power = (): P => {
    const base = atom()
    if (peek() === '^') {
      i++
      ws()
      const m = /^\d+/.exec(s.slice(i))
      if (!m) fail('After ^ write a whole number, like s^2.')
      i += m![0].length
      const n = parseInt(m![0], 10)
      if (n > maxDeg) fail(`Keep the degree at ${maxDeg} or below.`)
      let r: P = [1]
      for (let k = 0; k < n; k++) r = mul(r, base)
      return r
    }
    return base
  }
  const atom = (): P => {
    const c = peek()
    if (c === undefined) fail('The expression ends too early.')
    if (c === 's' || c === 'S') {
      i++
      return [0, 1]
    }
    if (c === '(') {
      i++
      const r = expr()
      if (peek() !== ')') fail('A closing bracket ) is missing.')
      i++
      return r
    }
    const m = /^(\d+\.?\d*|\.\d+)(e-?\d+)?/.exec(s.slice(i))
    if (!m) fail(`I don't understand "${c}". Use numbers, s, + − * / ^ and brackets.`)
    i += m![0].length
    return [parseFloat(m![0])]
  }

  if (!s.trim()) fail('This field is empty.')
  const r = expr()
  if (peek() !== undefined) fail(`I don't understand "${s.slice(i).trim()}".`)
  if (r.length - 1 > maxDeg) fail(`Keep the degree at ${maxDeg} or below.`)
  return [...r].reverse()
}
