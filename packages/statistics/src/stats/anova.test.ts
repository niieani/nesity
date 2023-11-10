import { oneWayANOVA } from './anova.js'
import { Factor } from './factor.js'
import { Vector } from './vector.js'

describe('Anova', () => {
  const folate = new Vector([
    243, 251, 275, 291, 347, 354, 380, 392, 206, 210, 226, 249, 255, 273, 285,
    295, 309, 241, 258, 270, 293, 328,
  ])
  const ventilation = new Factor([
    'N2O+O2,24h',
    'N2O+O2,24h',
    'N2O+O2,24h',
    'N2O+O2,24h',
    'N2O+O2,24h',
    'N2O+O2,24h',
    'N2O+O2,24h',
    'N2O+O2,24h',
    'N2O+O2,op',
    'N2O+O2,op',
    'N2O+O2,op',
    'N2O+O2,op',
    'N2O+O2,op',
    'N2O+O2,op',
    'N2O+O2,op',
    'N2O+O2,op',
    'N2O+O2,op',
    'O2,24h',
    'O2,24h',
    'O2,24h',
    'O2,24h',
    'O2,24h',
  ])

  const a = oneWayANOVA(ventilation, folate)

  it('tdf should return the correct degrees of freedom', () => {
    expect(a.tdf).toBe(2)
  })

  it('tss should return the correct total sum of squares', () => {
    expect(a.tss).toBeCloseTo(15_516, 0.1)
  })

  it('tms should return the correct total mean square', () => {
    expect(a.tms).toBeCloseTo(7_757.9, 0.1)
  })

  it('edf should return the correct error degrees of freedom', () => {
    expect(a.edf).toBe(19)
  })

  it('ess should return the correct error sum of squares', () => {
    expect(a.ess).toBeCloseTo(39_716, 0.1)
  })

  it('ems should return the correct error mean square', () => {
    expect(a.ems).toBeCloseTo(2_090.3, 0.1)
  })

  it('f should return the correct F statistic', () => {
    expect(a.f).toBeCloseTo(3.711_3, 0.000_1)
  })

  it('p should return the correct p-value', () => {
    expect(a.p).toBeCloseTo(0.043_59, 0.000_01)
  })
})
