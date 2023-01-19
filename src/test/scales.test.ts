import { describe, expect, test } from 'vitest'
import { detectScales } from '../utils/scales'

test('detectScales()', () => {
  const presence = {
    A: 1,
    B: 0.2438918433076174,
    C: 0.6079095198861508,
    D: 0.3573140588719945,
    E: 0.4976630963972735,
    G: 0.41138491498764135,
  }

  const scales = detectScales(presence)
})
