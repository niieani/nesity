import { REAL_WORLD_DATA_1 } from './__fixtures__/testSamples'
import { compare } from './compare'
import { getStableRandom } from './utilities'

describe('compare', () => {
  it('should compare two datasets', () => {
    const START = 20
    const SIZE = 16
    const result = compare({
      data1: REAL_WORLD_DATA_1.sample1.slice(START, START + SIZE),
      data2: REAL_WORLD_DATA_1.sample2.slice(START, START + SIZE),
      noiseValuesPerSample: 3,
      kernelStretchFactor: 1,
      random: getStableRandom(500),
    })

    expect(result).toMatchInlineSnapshot(`
      Object {
        "cohensD": 0.18330704064377773,
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
          "stdev": 128.47764545139032,
          "validCount": 16,
          "variance": 16506.505380733157,
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
          "stdev": 97.91030502224473,
          "validCount": 12,
          "variance": 9586.427829549002,
        },
        "meanDifference": 24.72987916666648,
        "nonOverlapMeasure": 0.5727214448176261,
        "originalResult": Object {
          "cohensD": -0.5150511924674506,
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
            "stdev": 128.47764545139034,
            "validCount": 16,
            "variance": 16506.50538073316,
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
            "stdev": 742.8111638223221,
            "validCount": 16,
            "variance": 551768.4250990726,
          },
          "meanDifference": -310.4344906250001,
          "nonOverlapMeasure": 0.30325862382504015,
          "outcome": "equal",
          "overlappingCoefficient": 0.7967730585096843,
          "pooledStDev": 533.0454626388849,
          "pooledVariance": 284137.4652399029,
          "probabilityOfSuperiority": 0.35785575561146643,
          "ttest": Object {
            "degreesOfFreedom": 15.896666721939464,
            "greater": Object {
              "confidenceInterval": Array [
                -639.5950082629629,
                Infinity,
              ],
              "pValue": 0.9404324401755751,
              "rejected": false,
            },
            "less": Object {
              "confidenceInterval": Array [
                -Infinity,
                18.726027012962785,
              ],
              "pValue": 0.059567559824424805,
              "rejected": false,
            },
            "tValue": -1.6472165983623648,
            "twoSided": Object {
              "confidenceInterval": Array [
                -710.1630764402786,
                89.29409519027843,
              ],
              "pValue": 0.11913511964884961,
              "rejected": false,
            },
          },
        },
        "outcome": "equal",
        "overlappingCoefficient": 0.9269733272930984,
        "pooledStDev": 116.52802350904471,
        "pooledVariance": 13578.780262924476,
        "probabilityOfSuperiority": 0.5515655313983803,
        "ttest": Object {
          "degreesOfFreedom": 25.98106296036767,
          "greater": Object {
            "confidenceInterval": Array [
              -48.24633661040269,
              Infinity,
            ],
            "pValue": 0.2841175035056639,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              97.70609494373612,
            ],
            "pValue": 0.7158824964943361,
            "rejected": false,
          },
          "tValue": 0.5780083258579302,
          "twoSided": Object {
            "confidenceInterval": Array [
              -63.21833143468515,
              112.67808976801855,
            ],
            "pValue": 0.5682350070113278,
            "rejected": false,
          },
        },
      }
    `)
  })
})
