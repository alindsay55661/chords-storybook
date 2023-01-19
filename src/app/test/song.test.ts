import { describe, expect, test } from 'vitest'
import { makeNote, Note } from '../utils/parse'
import { isNoteInRange } from '../utils/song'

test('isNoteInRange()', () => {
  const rangeStart = 100
  const rangeEnd = 200
  const withinRange = { startTicks: 120, durationTicks: 50, noteNumber: 60 }
  const startsInRange = { startTicks: 120, durationTicks: 300, noteNumber: 60 }
  const endsInRange = { startTicks: 0, durationTicks: 150, noteNumber: 60 }
  const throughRange = { startTicks: 0, durationTicks: 300, noteNumber: 60 }
  const beforeRange = { startTicks: 0, durationTicks: 80, noteNumber: 60 }
  const afterRange = { startTicks: 250, durationTicks: 80, noteNumber: 60 }

  expect(
    isNoteInRange(makeNote(withinRange) as Note, rangeStart, rangeEnd),
  ).toBe(true)
  expect(
    isNoteInRange(makeNote(startsInRange) as Note, rangeStart, rangeEnd),
  ).toBe(true)
  expect(
    isNoteInRange(makeNote(endsInRange) as Note, rangeStart, rangeEnd),
  ).toBe(true)
  expect(
    isNoteInRange(makeNote(throughRange) as Note, rangeStart, rangeEnd),
  ).toBe(true)

  expect(
    isNoteInRange(makeNote(beforeRange) as Note, rangeStart, rangeEnd),
  ).toBe(false)
  expect(
    isNoteInRange(makeNote(afterRange) as Note, rangeStart, rangeEnd),
  ).toBe(false)
})
