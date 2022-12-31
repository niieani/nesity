import { REAL_WORLD_DATA_1 } from './__fixtures__/testSamples'
import { compare } from './compare'
import { getStableRandom } from './utilities'

describe('compare', () => {
  it('should compare two datasets', () => {
    const START = 20
    const result = compare({
      data1: REAL_WORLD_DATA_1.sample1.slice(START, START + 16),
      data2: REAL_WORLD_DATA_1.sample2.slice(START, START + 16),
      noiseValuesPerSample: 3,
      kernelStretchFactor: 1,
      random: getStableRandom(500),
    })

    expect(result).toMatchInlineSnapshot(`
      Object {
        "cohensD": 0.22023379161470488,
        "data1": Object {
          "data": Array [
            1168.7350000000001,
            1177.763,
            1219.81795,
            1225.22865,
            1237.119,
            1240.996,
            1268.1488000000002,
            1282.825,
            1304.083,
            1313.175,
            1319.122,
            1322.9486000000002,
            1326.52195,
            1448.5129499999998,
            1585.888,
            1604.7237,
          ],
          "invalidCount": 0,
          "mean": 1315.3505374999997,
          "modalityCount": 1,
          "normalityProbability": 0.9909270379330676,
          "rejectedData": Array [],
          "stdev": 124.39794529829395,
          "validCount": 16,
          "variance": 15474.848794437334,
        },
        "data2": Object {
          "data": Array [
            1174.584,
            1204.708,
            1206.626,
            1217.9219000000003,
            1221.26555,
            1247.595,
            1291.9488500000002,
            1296.476,
            1352.537,
            1354.0929999999998,
            1445.1730499999999,
            1474.51955,
          ],
          "invalidCount": 4,
          "mean": 1290.6206583333333,
          "modalityCount": 1,
          "normalityProbability": 0.8303665142929895,
          "rejectedData": Array [
            1944.3399499999998,
            2094.8806,
            2445.73,
            4040.1620000000003,
          ],
          "stdev": 93.74198015698863,
          "validCount": 12,
          "variance": 8787.558843753251,
        },
        "meanDifference": 24.72987916666648,
        "nonOverlapMeasure": 0.5871554596397097,
        "originalResult": Object {
          "cohensD": -0.6014784586799964,
          "data1": Object {
            "data": Array [
              1168.7350000000001,
              1177.763,
              1219.81795,
              1225.22865,
              1237.119,
              1240.996,
              1268.1488000000002,
              1282.825,
              1304.083,
              1313.175,
              1319.122,
              1322.9486000000002,
              1326.52195,
              1448.5129499999998,
              1585.888,
              1604.7237,
            ],
            "invalidCount": 0,
            "mean": 1315.3505375,
            "normalityProbability": 0.9909270379330676,
            "rejectedData": Array [],
            "stdev": 124.39794529829396,
            "validCount": 16,
            "variance": 15474.848794437337,
          },
          "data2": Object {
            "data": Array [
              1174.584,
              1204.708,
              1206.626,
              1217.9219000000003,
              1221.26555,
              1247.595,
              1291.9488500000002,
              1296.476,
              1352.537,
              1354.0929999999998,
              1445.1730499999999,
              1474.51955,
              1944.3399499999998,
              2094.8806,
              2445.73,
              4040.1620000000003,
            ],
            "invalidCount": 0,
            "mean": 1625.785028125,
            "normalityProbability": 0.9999683331360395,
            "rejectedData": Array [],
            "stdev": 719.2238167152007,
            "validCount": 16,
            "variance": 517282.89853038057,
          },
          "meanDifference": -310.4344906250001,
          "nonOverlapMeasure": 0.2737606775710079,
          "outcome": "equal",
          "overlappingCoefficient": 0.7636133520665646,
          "pooledStDev": 516.1190498929573,
          "pooledVariance": 266378.87366240897,
          "probabilityOfSuperiority": 0.33530553569798455,
        },
        "outcome": "equal",
        "overlappingCoefficient": 0.9123166687278216,
        "pooledStDev": 112.28921313733255,
        "pooledVariance": 12608.867387001299,
        "probabilityOfSuperiority": 0.561876605455133,
      }
    `)
  })
})
