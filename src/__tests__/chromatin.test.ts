import { expect, test } from 'vitest'
import { coordinateToBin } from '../chromatin.ts'

test('coordinateToBin simple', () => {
  //~ In an aligned sequence, and for bins with resolution
  //~ of 10, a 22nd basebair will fall into the 3rd bin (index 2)
  expect(coordinateToBin(22, 10)).toBe(2)
})

test('coordinateToBin with start offset', () => {
  expect(coordinateToBin(33, 10, 20)).toBe(1)
})
