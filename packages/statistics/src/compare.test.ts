import {
  REAL_WORLD_DATA_1,
  REAL_WORLD_DATA_2_SIMILAR,
  REAL_WORLD_DATA_3_SIMILAR,
  REAL_WORLD_DATA_4_SIMILAR,
  REAL_WORLD_DATA_5_BIMODAL,
  REAL_WORLD_DATA_6_GREATER,
  REAL_WORLD_DATA_7_BIMODAL,
  REAL_WORLD_DATA_8_SIMILAR,
  REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY,
} from './__fixtures__/testSamples'
import { compare } from './compare'
import { getStableRandom } from './utilities'

describe('compare', () => {
  it.concurrent('should compare two datasets', () => {
    const START = 20
    const SIZE = 16
    const { originalResult, ...result } = compare({
      data1: REAL_WORLD_DATA_1.sample1.slice(START, START + SIZE),
      data2: REAL_WORLD_DATA_1.sample2.slice(START, START + SIZE),
      noiseValuesPerSample: 2,
      random: getStableRandom(5_000),
    })

    expect(result.outcome).toBe('similar')
    expect(result).toMatchInlineSnapshot(`
      Object {
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
          ],
          "dataCount": 13,
          "discardedCount": 3,
          "discardedData": Array [
            1448.5129499999998,
            1585.888,
            1604.7237,
          ],
          "mean": 1262.0372269230768,
          "modalityCount": 1,
          "normalityProbability": 0.7877846020925403,
          "stdev": 54.763117695107304,
          "variance": 2998.999059688175,
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
          ],
          "dataCount": 10,
          "discardedCount": 6,
          "discardedData": Array [
            1445.1730499999999,
            1474.51955,
            1944.3399499999998,
            2094.8806,
            2445.73,
            4040.1620000000003,
          ],
          "mean": 1256.7755300000001,
          "modalityCount": 1,
          "normalityProbability": 0.7638960322720459,
          "stdev": 63.500249238291225,
          "variance": 4032.2816533251057,
        },
        "denoiseSettings": Object {
          "bandwidth": 34.6006685881664,
          "kernelStretchFactor": 0.8,
          "threshold": 128.47764545139034,
        },
        "effectSize": Object {
          "cohensD": 0.07462758875961048,
          "nonOverlapMeasure": 0.5297444886655136,
          "overlappingCoefficient": 0.9702348068281813,
          "probabilityOfSuperiority": 0.5210422877980241,
        },
        "meanDifference": -5.26169692307667,
        "outcome": "similar",
        "pooledStDev": 58.667149725899804,
        "pooledVariance": 3441.8344569611454,
        "stdevDifference": -8.73713154318392,
        "ttest": Object {
          "degreesOfFreedom": 17.85959635059804,
          "greater": Object {
            "confidenceInterval": Array [
              -38.41677038682757,
              Infinity,
            ],
            "pValue": 0.41841376476286074,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              48.94016423298136,
            ],
            "pValue": 0.5815862352371393,
            "rejected": false,
          },
          "tValue": 0.20898179958672475,
          "twoSided": Object {
            "confidenceInterval": Array [
              -47.66467094089782,
              58.18806478705162,
            ],
            "pValue": 0.8368275295257214,
            "rejected": false,
          },
        },
      }
    `)
  })

  it.concurrent(
    'should compare two small datasets with noise iterations (similar 1)',
    () => {
      const { originalResult, ...result } = compare({
        data1: REAL_WORLD_DATA_3_SIMILAR.data1,
        data2: REAL_WORLD_DATA_3_SIMILAR.data2,
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "comparedModalities1": Array [
                  Object {
                    "data": Array [
                      258.303,
                      268.269,
                      270.022,
                      271.094,
                      271.767,
                      276.065,
                      276.907,
                      278.611,
                      278.948,
                      285.879,
                      286.215,
                    ],
                    "dataCount": 11,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 274.73454545454547,
                    "normalityProbability": 0.3097986213870877,
                    "stdev": 8.070541597236659,
                    "variance": 65.13364167272724,
                  },
                  Object {
                    "data": Array [
                      307.04,
                      308.893,
                      319.635,
                    ],
                    "dataCount": 3,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 311.856,
                    "normalityProbability": 1,
                    "stdev": 6.80022301104897,
                    "variance": 46.24303299999991,
                  },
                ],
                "comparedModalities2": Array [
                  Object {
                    "data": Array [
                      271.469,
                      271.617,
                      272.278,
                      275.328,
                      276.265,
                      277.982,
                      278.954,
                      282.291,
                      283.362,
                      283.981,
                      285.537,
                    ],
                    "dataCount": 11,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 278.09672727272726,
                    "normalityProbability": 0.6819670385723727,
                    "stdev": 5.16563374797147,
                    "variance": 26.68377201818178,
                  },
                  Object {
                    "data": Array [
                      296.633,
                      298.389,
                      302.163,
                    ],
                    "dataCount": 3,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 299.06166666666667,
                    "normalityProbability": 0,
                    "stdev": 2.825700857014664,
                    "variance": 7.984585333333405,
                  },
                ],
                "data1": Object {
                  "data": Array [
                    258.303,
                    268.269,
                    270.022,
                    271.094,
                    271.767,
                    276.065,
                    276.907,
                    278.611,
                    278.948,
                    285.879,
                    286.215,
                    307.04,
                    308.893,
                    319.635,
                  ],
                  "dataCount": 14,
                  "discardedCount": 2,
                  "discardedData": Array [
                    220.648,
                    223.675,
                  ],
                  "mean": 274.73454545454547,
                  "modalityCount": 1,
                  "normalityProbability": 0.4576989168041403,
                  "stdev": 7.798330471625011,
                  "variance": 61.08565409999996,
                },
                "data2": Object {
                  "data": Array [
                    271.469,
                    271.617,
                    272.278,
                    275.328,
                    276.265,
                    277.982,
                    278.954,
                    282.291,
                    283.362,
                    283.981,
                    285.537,
                    296.633,
                    298.389,
                    302.163,
                  ],
                  "dataCount": 14,
                  "discardedCount": 2,
                  "discardedData": Array [
                    29.341,
                    198.564,
                  ],
                  "mean": 278.09672727272726,
                  "modalityCount": 1,
                  "normalityProbability": 0.5358312445925786,
                  "stdev": 4.664219557052155,
                  "variance": 22.67680344285713,
                },
                "denoiseSettings": Object {
                  "bandwidth": 6.318408872379358,
                  "kernelStretchFactor": 0.8,
                  "threshold": 26.341152270971367,
                },
                "discardedModalities1": Array [
                  Array [
                    220.648,
                    223.675,
                  ],
                ],
                "discardedModalities2": Array [
                  Array [
                    29.341,
                  ],
                  Array [
                    198.564,
                  ],
                ],
                "effectSize": Object {
                  "cohensD": -0.45029063157208304,
                  "nonOverlapMeasure": 0.3262504466230361,
                  "overlappingCoefficient": 0.8218662289193954,
                  "probabilityOfSuperiority": 0.37508941944517693,
                },
                "meanDifference": -0.09992857142858735,
                "mergedFromMultipleModalities": true,
                "outcome": "similar",
                "pooledStDev": 6.4715708117449,
                "pooledVariance": 41.88122877142854,
                "stdevDifference": 3.1341109145728563,
                "ttest": Object {
                  "degreesOfFreedom": 13.942008104075084,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -6.105046793811919,
                      Infinity,
                    ],
                    "pValue": 0.6904496330264843,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      6.3049039366690955,
                    ],
                    "pValue": 0.3095503669735157,
                    "rejected": false,
                  },
                  "tValue": -0.269511369840133,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -7.80158068421277,
                      8.001437827069946,
                    ],
                    "pValue": 0.21896833021352227,
                    "rejected": false,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two small datasets with noise iterations (similar)',
    () => {
      const { originalResult, ...result } = compare({
        data1: REAL_WORLD_DATA_4_SIMILAR.data1,
        data2: REAL_WORLD_DATA_4_SIMILAR.data2,
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "comparedModalities1": Array [
                  Object {
                    "data": Array [
                      258.32,
                      268.336,
                      270.048,
                      271.074,
                      271.781,
                      276.075,
                      276.931,
                      278.617,
                      278.959,
                      285.97,
                      286.25,
                    ],
                    "dataCount": 11,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 274.7600909090909,
                    "normalityProbability": 0.31931801360806844,
                    "stdev": 8.079851934961999,
                    "variance": 65.28400729090916,
                  },
                  Object {
                    "data": Array [
                      307.098,
                      309,
                      319.647,
                    ],
                    "dataCount": 3,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 311.91499999999996,
                    "normalityProbability": 1,
                    "stdev": 6.763303113124523,
                    "variance": 45.742268999999865,
                  },
                ],
                "comparedModalities2": Array [
                  Object {
                    "data": Array [
                      271.447,
                      271.609,
                      272.313,
                      275.343,
                      276.176,
                      277.955,
                      278.964,
                      282.302,
                      283.365,
                      284.021,
                      285.545,
                    ],
                    "dataCount": 11,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 278.0945454545455,
                    "normalityProbability": 0.6789762980636239,
                    "stdev": 5.1751151941505,
                    "variance": 26.78181727272737,
                  },
                  Object {
                    "data": Array [
                      296.697,
                      298.422,
                      302.151,
                    ],
                    "dataCount": 3,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 299.09,
                    "normalityProbability": 0,
                    "stdev": 2.787686675363644,
                    "variance": 7.771197000000008,
                  },
                ],
                "data1": Object {
                  "data": Array [
                    258.32,
                    268.336,
                    270.048,
                    271.074,
                    271.781,
                    276.075,
                    276.931,
                    278.617,
                    278.959,
                    285.97,
                    286.25,
                    307.098,
                    309,
                    319.647,
                  ],
                  "dataCount": 14,
                  "discardedCount": 2,
                  "discardedData": Array [
                    220.604,
                    223.656,
                  ],
                  "mean": 274.7600909090909,
                  "modalityCount": 1,
                  "normalityProbability": 0.46517843926348235,
                  "stdev": 7.79773433028254,
                  "variance": 61.09649194285717,
                },
                "data2": Object {
                  "data": Array [
                    271.447,
                    271.609,
                    272.313,
                    275.343,
                    276.176,
                    277.955,
                    278.964,
                    282.302,
                    283.365,
                    284.021,
                    285.545,
                    296.697,
                    298.422,
                    302.151,
                  ],
                  "dataCount": 14,
                  "discardedCount": 2,
                  "discardedData": Array [
                    198.567,
                    3434.452,
                  ],
                  "mean": 278.0945454545455,
                  "modalityCount": 1,
                  "normalityProbability": 0.5334813770499902,
                  "stdev": 4.663523368696174,
                  "variance": 22.708112928571506,
                },
                "denoiseSettings": Object {
                  "bandwidth": 5.3031931238020755,
                  "kernelStretchFactor": 0.8,
                  "threshold": 562.3873600000004,
                },
                "discardedModalities1": Array [
                  Array [
                    220.604,
                    223.656,
                  ],
                ],
                "discardedModalities2": Array [
                  Array [
                    198.567,
                  ],
                  Array [
                    3434.452,
                  ],
                ],
                "effectSize": Object {
                  "cohensD": -0.4464648592830384,
                  "nonOverlapMeasure": 0.3276307454690133,
                  "overlappingCoefficient": 0.8233546134873136,
                  "probabilityOfSuperiority": 0.3761157473634332,
                },
                "meanDifference": -0.12828571428566526,
                "mergedFromMultipleModalities": true,
                "outcome": "similar",
                "pooledStDev": 6.473198779252367,
                "pooledVariance": 41.90230243571433,
                "stdevDifference": 3.1342109615863665,
                "ttest": Object {
                  "degreesOfFreedom": 13.945178186857653,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -6.07107379589638,
                      Infinity,
                    ],
                    "pValue": 0.6886076299004139,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      6.327645224467798,
                    ],
                    "pValue": 0.31139237009958604,
                    "rejected": false,
                  },
                  "tValue": -0.2549020141045023,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -7.766763912497371,
                      8.02333534106879,
                    ],
                    "pValue": 0.22223278237764602,
                    "rejected": false,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two small datasets with noise iterations (similar - different sample)',
    () => {
      const { originalResult, ...result } = compare({
        data1: REAL_WORLD_DATA_2_SIMILAR.data1,
        data2: REAL_WORLD_DATA_2_SIMILAR.data2,
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    8490.293000000001,
                    8518.646999999997,
                    8560.180999999999,
                    8624.697000000002,
                    8685.822000000011,
                    8786.13300000001,
                    8818.657000000012,
                    8827.559999999996,
                    8937.128999999986,
                    9024.461000000007,
                    9122.639000000003,
                    9156.037000000011,
                    9260.620000000003,
                    9575.397999999996,
                  ],
                  "dataCount": 14,
                  "discardedCount": 2,
                  "discardedData": Array [
                    10789.819000000023,
                    12178.027000000016,
                  ],
                  "mean": 8884.876714285718,
                  "modalityCount": 1,
                  "normalityProbability": 0.4830977036553685,
                  "stdev": 315.04092536524325,
                  "variance": 99250.78465498876,
                },
                "data2": Object {
                  "data": Array [
                    8447.615000000002,
                    8504.422999999988,
                    8551.507999999989,
                    8672.03300000001,
                    8672.610999999995,
                    8751.861000000015,
                    8813.568000000007,
                    8854.921,
                    8918.064000000011,
                    8929.218999999994,
                    9004.06799999999,
                    9151.699999999988,
                    9178.569,
                    9235.703,
                    9378.695000000009,
                    9492.404999999995,
                  ],
                  "dataCount": 16,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 8909.8101875,
                  "modalityCount": 1,
                  "normalityProbability": 0.19957423060483725,
                  "stdev": 312.1875018910312,
                  "variance": 97461.03633696263,
                },
                "denoiseSettings": Object {
                  "bandwidth": 197.36943707934827,
                  "kernelStretchFactor": 0.8,
                  "threshold": 968.6810179447152,
                },
                "effectSize": Object {
                  "cohensD": -0.06963521727873759,
                  "nonOverlapMeasure": 0.4722420028150469,
                  "overlappingCoefficient": 0.9722251794804171,
                  "probabilityOfSuperiority": 0.4803642028043161,
                },
                "meanDifference": 24.93347321428155,
                "outcome": "similar",
                "pooledStDev": 313.5155353617888,
                "pooledVariance": 98291.99091318905,
                "stdevDifference": 2.853423474212036,
                "ttest": Object {
                  "degreesOfFreedom": 27.403602652184716,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -220.38075704079165,
                      Infinity,
                    ],
                    "pValue": 0.5851604482916946,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      170.5138106122249,
                    ],
                    "pValue": 0.4148395517083054,
                    "rejected": false,
                  },
                  "tValue": -0.21717721422878858,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -260.3358314395426,
                      210.46888501097587,
                    ],
                    "pValue": 0.8296791034166108,
                    "rejected": false,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two small datasets with noise iterations (bimodal)',
    () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_5_BIMODAL,
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('similar')
      expect(result.data1.dataCount + result.data1.discardedCount).toBe(16)
      expect(result.data2.dataCount + result.data2.discardedCount).toBe(16)
      expect(result).toMatchInlineSnapshot(`
              Object {
                "comparedModalities1": Array [
                  Object {
                    "data": Array [
                      519.801,
                      533.615,
                      551.024,
                      555.736,
                      563.744,
                      581.388,
                      587.853,
                      596.867,
                      614.921,
                    ],
                    "dataCount": 9,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 567.2165555555556,
                    "normalityProbability": 0.021263344498033687,
                    "stdev": 30.750844805920003,
                    "variance": 945.6144562777772,
                  },
                  Object {
                    "data": Array [
                      1061.516,
                      1067.188,
                      1070.919,
                      1093.33,
                      1108.861,
                      1109.863,
                      1159.773,
                    ],
                    "dataCount": 7,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 1095.9214285714286,
                    "normalityProbability": 0.709709919769268,
                    "stdev": 34.35113648220454,
                    "variance": 1180.0005776190437,
                  },
                ],
                "comparedModalities2": Array [
                  Object {
                    "data": Array [
                      563.563,
                      567.498,
                      578.969,
                      579.425,
                      581.83,
                      601.984,
                      633.422,
                    ],
                    "dataCount": 7,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 586.6701428571429,
                    "normalityProbability": 0.8620144797621213,
                    "stdev": 24.003430861917582,
                    "variance": 576.1646931428575,
                  },
                  Object {
                    "data": Array [
                      1070.095,
                      1083.78,
                      1087.077,
                      1090.509,
                      1100.632,
                      1108.773,
                      1113.105,
                      1152.18,
                      1169.366,
                    ],
                    "dataCount": 9,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 1108.3907777777779,
                    "normalityProbability": 0.7795235585319694,
                    "stdev": 32.71913508093459,
                    "variance": 1070.5418004444446,
                  },
                ],
                "data1": Object {
                  "data": Array [
                    519.801,
                    533.615,
                    551.024,
                    555.736,
                    563.744,
                    581.388,
                    587.853,
                    596.867,
                    614.921,
                    1061.516,
                    1067.188,
                    1070.919,
                    1093.33,
                    1108.861,
                    1109.863,
                    1159.773,
                  ],
                  "dataCount": 16,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 1095.9214285714286,
                  "modalityCount": 2,
                  "normalityProbability": 0.3224587211791987,
                  "stdev": 32.32597241429448,
                  "variance": 1048.1583843645813,
                },
                "data2": Object {
                  "data": Array [
                    563.563,
                    567.498,
                    578.969,
                    579.425,
                    581.83,
                    601.984,
                    633.422,
                    1070.095,
                    1083.78,
                    1087.077,
                    1090.509,
                    1100.632,
                    1108.773,
                    1113.105,
                    1152.18,
                    1169.366,
                  ],
                  "dataCount": 16,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 1108.3907777777779,
                  "modalityCount": 2,
                  "normalityProbability": 0.8156133365701609,
                  "stdev": 28.906014485114653,
                  "variance": 854.2518160000002,
                },
                "denoiseSettings": Object {
                  "bandwidth": 138.94510302889046,
                  "kernelStretchFactor": 0.8,
                  "threshold": 268.7971949089747,
                },
                "discardedModalities1": Array [],
                "discardedModalities2": Array [],
                "effectSize": Object {
                  "cohensD": -0.3573440691562802,
                  "nonOverlapMeasure": 0.36041712123426145,
                  "overlappingCoefficient": 0.8581952289755203,
                  "probabilityOfSuperiority": 0.4002575919043733,
                },
                "meanDifference": 15.961468253968292,
                "mergedFromMultipleModalities": true,
                "outcome": "similar",
                "pooledStDev": 30.860424077234526,
                "pooledVariance": 952.3657742267565,
                "stdevDifference": 3.41995792917983,
                "ttest": Object {
                  "degreesOfFreedom": 13.351249157862783,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -43.057479465863494,
                      Infinity,
                    ],
                    "pValue": 0.8368409191984947,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      11.134542957926907,
                    ],
                    "pValue": 0.16315908080150532,
                    "rejected": false,
                  },
                  "tValue": -1.0782645794261538,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -49.00045559037997,
                      17.07751908244339,
                    ],
                    "pValue": 0.32631816160301064,
                    "rejected": false,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two small datasets with noise iterations (bimodal 2)',
    () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_7_BIMODAL,
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "comparedModalities1": Array [
                  Object {
                    "data": Array [
                      10.239,
                      10.293,
                      10.4,
                      10.856,
                      11.11,
                      11.706,
                      11.935,
                      13.279,
                      66.587,
                      68.986,
                    ],
                    "dataCount": 10,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 22.5391,
                    "normalityProbability": 0.9999867832152746,
                    "stdev": 23.871928621290742,
                    "variance": 569.8689761,
                  },
                  Object {
                    "data": Array [
                      578.245,
                      586.523,
                      593.91,
                      608.943,
                    ],
                    "dataCount": 4,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 591.90525,
                    "normalityProbability": 0.11204146205647347,
                    "stdev": 13.036806776073131,
                    "variance": 169.9583309166663,
                  },
                ],
                "comparedModalities2": Array [
                  Object {
                    "data": Array [
                      566.367,
                      607.782,
                      609.666,
                      610.453,
                      612.29,
                      621.299,
                      625.553,
                    ],
                    "dataCount": 7,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 607.63,
                    "normalityProbability": 0.9832576799307058,
                    "stdev": 19.341509713566836,
                    "variance": 374.09399800000034,
                  },
                  Object {
                    "data": Array [
                      24.992,
                      28.01,
                      29.373,
                      32.647,
                    ],
                    "dataCount": 4,
                    "discardedCount": 0,
                    "discardedData": Array [],
                    "mean": 28.755499999999998,
                    "normalityProbability": 0.01545389028355526,
                    "stdev": 3.1751525422673255,
                    "variance": 10.081593666666661,
                  },
                ],
                "data1": Object {
                  "data": Array [
                    10.239,
                    10.293,
                    10.4,
                    10.856,
                    11.11,
                    11.706,
                    11.935,
                    13.279,
                    66.587,
                    68.986,
                    578.245,
                    586.523,
                    593.91,
                    608.943,
                  ],
                  "dataCount": 14,
                  "discardedCount": 2,
                  "discardedData": Array [
                    127.194,
                    706.821,
                  ],
                  "mean": 22.5391,
                  "modalityCount": 2,
                  "normalityProbability": 0.7462881200270457,
                  "stdev": 20.77617952265714,
                  "variance": 455.60879176190474,
                },
                "data2": Object {
                  "data": Array [
                    566.367,
                    607.782,
                    609.666,
                    610.453,
                    612.29,
                    621.299,
                    625.553,
                    24.992,
                    28.01,
                    29.373,
                    32.647,
                  ],
                  "dataCount": 11,
                  "discardedCount": 5,
                  "discardedData": Array [
                    93.469,
                    95.761,
                    98.026,
                    99.019,
                    102.28,
                  ],
                  "mean": 607.63,
                  "modalityCount": 2,
                  "normalityProbability": 0.6313290291499237,
                  "stdev": 13.462834378548832,
                  "variance": 241.72585096969718,
                },
                "denoiseSettings": Object {
                  "bandwidth": 20.433103773604955,
                  "kernelStretchFactor": 0.8,
                  "threshold": 39.5289999999999,
                },
                "discardedModalities1": Array [
                  Array [
                    127.194,
                  ],
                  Array [
                    706.821,
                  ],
                ],
                "discardedModalities2": Array [
                  Array [
                    93.469,
                    95.761,
                    98.026,
                    99.019,
                    102.28,
                  ],
                ],
                "effectSize": Object {
                  "cohensD": -26.078158388538707,
                  "nonOverlapMeasure": 0,
                  "overlappingCoefficient": 0,
                  "probabilityOfSuperiority": 0,
                },
                "meanDifference": 212.2854941558442,
                "mergedFromMultipleModalities": true,
                "outcome": "similar",
                "pooledStDev": 19.004977567411487,
                "pooledVariance": 361.1891723378139,
                "stdevDifference": 7.313345144108309,
                "ttest": Object {
                  "degreesOfFreedom": 10.930071585811328,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -229.66292857662523,
                      Infinity,
                    ],
                    "pValue": 0.6753248510151051,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      -194.90805973506312,
                    ],
                    "pValue": 0.3246751489848949,
                    "rejected": false,
                  },
                  "tValue": -10.347305248871358,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -233.98583294061544,
                      -190.58515537107286,
                    ],
                    "pValue": 3.5138085947715135e-7,
                    "rejected": true,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two small datasets with noise iterations (similar 2)',
    () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_8_SIMILAR,
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    417.2763277282715,
                    422.9192844238281,
                    436.05932772827146,
                    436.75832551574706,
                    453.83032772827147,
                    476.99342551574705,
                    477.94632772827146,
                    492.4853277282715,
                    492.64802772827153,
                    513.3580277282714,
                    519.9420277282716,
                    523.3875277282716,
                    555.0793068237305,
                    587.5708455505371,
                  ],
                  "dataCount": 14,
                  "discardedCount": 2,
                  "discardedData": Array [
                    795.7223277282715,
                    803.6723255157472,
                  ],
                  "mean": 486.1610312417168,
                  "modalityCount": 1,
                  "normalityProbability": 0.29639226652268136,
                  "stdev": 50.59236113207368,
                  "variance": 2559.5870049181594,
                },
                "data2": Object {
                  "data": Array [
                    407.80132551574707,
                    412.0413277282715,
                    424.1903255157471,
                    433.7193277282715,
                    437.6123277282715,
                    485.8062277282715,
                    496.87568442382803,
                    497.6226277282715,
                    500.8671844238281,
                    502.01132772827145,
                    507.2160255157471,
                    519.0287277282715,
                    570.6758455505371,
                    604.0097238983153,
                  ],
                  "dataCount": 14,
                  "discardedCount": 2,
                  "discardedData": Array [
                    939.1058455505372,
                    1330.7345961914061,
                  ],
                  "mean": 485.67700063868926,
                  "modalityCount": 1,
                  "normalityProbability": 0.7442370363176855,
                  "stdev": 58.075970369898414,
                  "variance": 3372.8183344053186,
                },
                "denoiseSettings": Object {
                  "bandwidth": 36.76318497015954,
                  "kernelStretchFactor": 0.8,
                  "threshold": 239.19134680450642,
                },
                "effectSize": Object {
                  "cohensD": 0.007702892446609495,
                  "nonOverlapMeasure": 0.5030729790893343,
                  "overlappingCoefficient": 0.9969269981189638,
                  "probabilityOfSuperiority": 0.5021729350965999,
                },
                "meanDifference": -0.4840306030275201,
                "outcome": "similar",
                "pooledStDev": 54.46285587133436,
                "pooledVariance": 2966.2026696617395,
                "stdevDifference": -7.483609237824737,
                "ttest": Object {
                  "degreesOfFreedom": 25.52042723761013,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -34.65053522129364,
                      Infinity,
                    ],
                    "pValue": 0.49071169184096974,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      35.618596427348336,
                    ],
                    "pValue": 0.5092883081590303,
                    "rejected": false,
                  },
                  "tValue": 0.023513724759134977,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -41.86782635263818,
                      42.83588755869288,
                    ],
                    "pValue": 0.9814233836819396,
                    "rejected": false,
                  },
                },
              }
          `)
    },
  )

  it.concurrent.only(
    'should compare two datasets with noise iterations (similar 3)',
    () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY,
        noiseValuesPerSample: 3,
        random: getStableRandom(5_000),
        iterations: 15,
        kernelStretchFactorRange: [0.5, 2.5],
        // discardedDataPenaltyFactor: -1,
      })

      // expect(result.outcome).toBe('similar')
      expect(result).toMatchInlineSnapshot(`
        Object {
          "data1": Object {
            "data": Array [
              507.9000000000233,
              564.5,
              566.9000000001397,
              576.2999999999884,
              591.7000000000698,
              596.2000000001863,
              624.9000000001397,
              625.5999999999767,
              631.3000000000466,
              665.5,
              697.8000000000466,
              892.7999999999884,
              1904.0999999999767,
              1944.1999999999534,
              1966.7999999999884,
              2314.1999999999534,
            ],
            "dataCount": 16,
            "discardedCount": 0,
            "discardedData": Array [],
            "mean": 979.4187500000298,
            "modalityCount": 1,
            "normalityProbability": 0.9999053619830512,
            "stdev": 638.9659461126369,
            "variance": 408277.4802916171,
          },
          "data2": Object {
            "data": Array [
              544.7000000001863,
              557.5,
              567.0999999999767,
              575.3000000000466,
              592.8999999999069,
              609.7000000000116,
              621.5,
              648.2000000000698,
              686.0999999999767,
              779.1000000000931,
              784.9000000000233,
              1314,
              1854.8000000000466,
              1911.9000000000233,
              1930.6999999999534,
              1995.4000000000233,
            ],
            "dataCount": 16,
            "discardedCount": 0,
            "discardedData": Array [],
            "mean": 998.3625000000211,
            "modalityCount": 1,
            "normalityProbability": 0.9997461967154787,
            "stdev": 581.2277957049126,
            "variance": 337825.75049999164,
          },
          "denoiseSettings": Object {
            "bandwidth": 215.16556062035738,
            "kernelStretchFactor": 0.8,
            "threshold": 581.2277957049126,
          },
          "effectSize": Object {
            "cohensD": -0.02743002300906164,
            "nonOverlapMeasure": 0.48905837617736886,
            "overlappingCoefficient": 0.9890573471253536,
            "probabilityOfSuperiority": 0.49226261851174014,
          },
          "meanDifference": 18.94374999999127,
          "outcome": "similar",
          "pooledStDev": 610.7795145515314,
          "pooledVariance": 373051.61539580434,
          "stdevDifference": 57.73815040772422,
          "ttest": Object {
            "degreesOfFreedom": 29.73487444577945,
            "greater": Object {
              "confidenceInterval": Array [
                -385.5597598038936,
                Infinity,
              ],
              "pValue": 0.5346585528347696,
              "rejected": false,
            },
            "less": Object {
              "confidenceInterval": Array [
                -Infinity,
                347.6722598039111,
              ],
              "pValue": 0.46534144716523046,
              "rejected": false,
            },
            "tValue": -0.08772562777212352,
            "twoSided": Object {
              "confidenceInterval": Array [
                -460.12348623724296,
                422.2359862372604,
              ],
              "pValue": 0.9306828943304609,
              "rejected": false,
            },
          },
        }
      `)
    },
  )

  it.concurrent(
    'should compare two small datasets with noise iterations (greater)',
    () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_6_GREATER,
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    1306.443,
                    1310.903,
                    1340.962,
                    1389.908,
                    1392.852,
                    1404.943,
                    1481.633,
                    1515.726,
                    1531.713,
                    2025.26,
                    2129.93,
                    2140.352,
                    2149.494,
                    2154.601,
                    2208.241,
                    2270.812,
                  ],
                  "dataCount": 16,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 1734.6108124999996,
                  "modalityCount": 1,
                  "normalityProbability": 0.997441432776035,
                  "stdev": 389.9511438157723,
                  "variance": 152061.89456322914,
                },
                "data2": Object {
                  "data": Array [
                    1282.607,
                    1401.62,
                    1437.79,
                    1694.19,
                    1769.783,
                    1889.373,
                    1966.746,
                    2059.694,
                    2150.603,
                    2175.936,
                    2185.475,
                    2224.197,
                    2324.154,
                    2352.64,
                    2408.004,
                    2502.639,
                  ],
                  "dataCount": 16,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 1989.0906874999998,
                  "modalityCount": 1,
                  "normalityProbability": 0.748517729160048,
                  "stdev": 377.4615563315411,
                  "variance": 142477.22650822916,
                },
                "denoiseSettings": Object {
                  "bandwidth": 192.22324701802228,
                  "kernelStretchFactor": 1.4,
                  "threshold": 377.4615563315411,
                },
                "effectSize": Object {
                  "cohensD": -0.5864643643728225,
                  "nonOverlapMeasure": 0.2787817510409292,
                  "overlappingCoefficient": 0.7693446868577472,
                  "probabilityOfSuperiority": 0.3391833546880571,
                },
                "meanDifference": 254.47987500000022,
                "outcome": "greater",
                "pooledStDev": 383.7571634976071,
                "pooledVariance": 147269.56053572914,
                "stdevDifference": 12.489587484231208,
                "ttest": Object {
                  "degreesOfFreedom": 29.96826563666702,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -484.7697018033032,
                      Infinity,
                    ],
                    "pValue": 0.964759198234362,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      -24.190048196696786,
                    ],
                    "pValue": 0.03524080176563802,
                    "rejected": true,
                  },
                  "tValue": -1.8756074143134736,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -531.5849420795118,
                      22.625192079511887,
                    ],
                    "pValue": 0.07048160353127604,
                    "rejected": false,
                  },
                },
              }
          `)
    },
  )

  it.concurrent('should compare two dataset with varying lengths', () => {
    const { originalResult, ...result } = compare({
      data1: [13.945, 14.055, 16.372, 30.464, 33.407, 68.132],
      data2: [30.142, 52.941],
      noiseValuesPerSample: 2,
      random: getStableRandom(5_000),
      iterations: 15,
    })

    expect(result.outcome).toBe('similar')
    expect(result).toMatchInlineSnapshot(`
      Object {
        "data1": Object {
          "data": Array [
            13.945,
            14.055,
            16.372,
            30.464,
            33.407,
            68.132,
          ],
          "dataCount": 6,
          "discardedCount": 0,
          "discardedData": Array [],
          "mean": 29.395833333333332,
          "normalityProbability": 0.9442472989953399,
          "stdev": 20.791395810927817,
          "variance": 432.28213976666683,
        },
        "data2": Object {
          "data": Array [
            30.142,
            52.941,
          ],
          "dataCount": 2,
          "discardedCount": 0,
          "discardedData": Array [],
          "mean": 41.5415,
          "normalityProbability": 0.39632812046348587,
          "stdev": 16.1213275042721,
          "variance": 259.89720050000005,
        },
        "effectSize": Object {
          "cohensD": -0,
          "nonOverlapMeasure": 0.5,
          "overlappingCoefficient": 1,
          "probabilityOfSuperiority": 0.5,
        },
        "meanDifference": 12.145666666666667,
        "outcome": "similar",
        "pooledStDev": 20.0885867236985,
        "pooledVariance": 403.55131655555573,
        "stdevDifference": 4.670068306655718,
        "ttest": Object {
          "degreesOfFreedom": 2.2763013762526123,
          "greater": Object {
            "confidenceInterval": Array [
              -50.406713190854944,
              Infinity,
            ],
            "pValue": 0.7633897280016656,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              26.115379857521617,
            ],
            "pValue": 0.2366102719983344,
            "rejected": false,
          },
          "tValue": -0.8545753820814761,
          "twoSided": Object {
            "confidenceInterval": Array [
              -66.70695625697836,
              42.41562292364503,
            ],
            "pValue": 0.4732205439966688,
            "rejected": false,
          },
        },
      }
    `)
  })

  it.concurrent(
    'should compare two identical datasets of exactly one data point',
    () => {
      const { originalResult, ...result } = compare({
        data1: [58],
        data2: [58],
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('equal')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    58,
                  ],
                  "dataCount": 1,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58,
                  "normalityProbability": 1,
                  "stdev": 0,
                  "variance": 0,
                },
                "data2": Object {
                  "data": Array [
                    58,
                  ],
                  "dataCount": 1,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58,
                  "normalityProbability": 0,
                  "stdev": 0,
                  "variance": 0,
                },
                "effectSize": Object {
                  "cohensD": NaN,
                  "nonOverlapMeasure": NaN,
                  "overlappingCoefficient": NaN,
                  "probabilityOfSuperiority": NaN,
                },
                "meanDifference": 0,
                "outcome": "equal",
                "pooledStDev": NaN,
                "pooledVariance": NaN,
                "stdevDifference": 0,
                "ttest": Object {
                  "degreesOfFreedom": NaN,
                  "greater": Object {
                    "confidenceInterval": Array [
                      NaN,
                      Infinity,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      NaN,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                  "tValue": NaN,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      NaN,
                      NaN,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two different datasets of exactly one data point',
    () => {
      const { originalResult, ...result } = compare({
        data1: [58],
        data2: [59],
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    58,
                  ],
                  "dataCount": 1,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58,
                  "normalityProbability": 1,
                  "stdev": 0,
                  "variance": 0,
                },
                "data2": Object {
                  "data": Array [
                    59,
                  ],
                  "dataCount": 1,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 59,
                  "normalityProbability": 0,
                  "stdev": 0,
                  "variance": 0,
                },
                "effectSize": Object {
                  "cohensD": NaN,
                  "nonOverlapMeasure": NaN,
                  "overlappingCoefficient": NaN,
                  "probabilityOfSuperiority": NaN,
                },
                "meanDifference": 1,
                "outcome": "greater",
                "pooledStDev": NaN,
                "pooledVariance": NaN,
                "stdevDifference": 0,
                "ttest": Object {
                  "degreesOfFreedom": NaN,
                  "greater": Object {
                    "confidenceInterval": Array [
                      NaN,
                      Infinity,
                    ],
                    "pValue": 0,
                    "rejected": true,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      NaN,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                  "tValue": NaN,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      NaN,
                      NaN,
                    ],
                    "pValue": 0,
                    "rejected": true,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two identical datasets of exactly two data points',
    () => {
      const { originalResult, ...result } = compare({
        data1: [58, 58],
        data2: [58, 58],
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('equal')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    58,
                    58,
                  ],
                  "dataCount": 2,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58,
                  "normalityProbability": 1,
                  "stdev": 0,
                  "variance": 0,
                },
                "data2": Object {
                  "data": Array [
                    58,
                    58,
                  ],
                  "dataCount": 2,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58,
                  "normalityProbability": 0,
                  "stdev": 0,
                  "variance": 0,
                },
                "effectSize": Object {
                  "cohensD": NaN,
                  "nonOverlapMeasure": NaN,
                  "overlappingCoefficient": NaN,
                  "probabilityOfSuperiority": NaN,
                },
                "meanDifference": 0,
                "outcome": "equal",
                "pooledStDev": 0,
                "pooledVariance": 0,
                "stdevDifference": 0,
                "ttest": Object {
                  "degreesOfFreedom": NaN,
                  "greater": Object {
                    "confidenceInterval": Array [
                      NaN,
                      Infinity,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      NaN,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                  "tValue": NaN,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      NaN,
                      NaN,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two different datasets of exactly the same two data points',
    () => {
      const { originalResult, ...result } = compare({
        data1: [58, 58],
        data2: [158, 158],
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    58,
                    58,
                  ],
                  "dataCount": 2,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58,
                  "normalityProbability": 1,
                  "stdev": 0,
                  "variance": 0,
                },
                "data2": Object {
                  "data": Array [
                    158,
                    158,
                  ],
                  "dataCount": 2,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 158,
                  "normalityProbability": 0,
                  "stdev": 0,
                  "variance": 0,
                },
                "effectSize": Object {
                  "cohensD": NaN,
                  "nonOverlapMeasure": NaN,
                  "overlappingCoefficient": NaN,
                  "probabilityOfSuperiority": NaN,
                },
                "meanDifference": 100,
                "outcome": "greater",
                "pooledStDev": 0,
                "pooledVariance": 0,
                "stdevDifference": 0,
                "ttest": Object {
                  "degreesOfFreedom": NaN,
                  "greater": Object {
                    "confidenceInterval": Array [
                      NaN,
                      Infinity,
                    ],
                    "pValue": 0,
                    "rejected": true,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      NaN,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                  "tValue": -Infinity,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      NaN,
                      NaN,
                    ],
                    "pValue": 0,
                    "rejected": true,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two different datasets of exactly the same 3 data points',
    () => {
      const { originalResult, ...result } = compare({
        data1: [58, 58, 58],
        data2: [158, 158, 158],
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    58,
                    58,
                    58,
                  ],
                  "dataCount": 3,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58,
                  "normalityProbability": 1,
                  "stdev": 0,
                  "variance": 0,
                },
                "data2": Object {
                  "data": Array [
                    158,
                    158,
                    158,
                  ],
                  "dataCount": 3,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 158,
                  "normalityProbability": 0,
                  "stdev": 0,
                  "variance": 0,
                },
                "effectSize": Object {
                  "cohensD": NaN,
                  "nonOverlapMeasure": NaN,
                  "overlappingCoefficient": NaN,
                  "probabilityOfSuperiority": NaN,
                },
                "meanDifference": 100,
                "outcome": "greater",
                "pooledStDev": 0,
                "pooledVariance": 0,
                "stdevDifference": 0,
                "ttest": Object {
                  "degreesOfFreedom": NaN,
                  "greater": Object {
                    "confidenceInterval": Array [
                      NaN,
                      Infinity,
                    ],
                    "pValue": 0,
                    "rejected": true,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      NaN,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                  "tValue": -Infinity,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      NaN,
                      NaN,
                    ],
                    "pValue": 0,
                    "rejected": true,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two different datasets of 4 exactly the same data points',
    () => {
      const { originalResult, ...result } = compare({
        data1: [58, 58, 58, 58],
        data2: [158, 158, 158, 158],
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    58,
                    58,
                    58,
                    58,
                  ],
                  "dataCount": 4,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58,
                  "normalityProbability": 1,
                  "stdev": 0,
                  "variance": 0,
                },
                "data2": Object {
                  "data": Array [
                    158,
                    158,
                    158,
                    158,
                  ],
                  "dataCount": 4,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 158,
                  "normalityProbability": 0,
                  "stdev": 0,
                  "variance": 0,
                },
                "effectSize": Object {
                  "cohensD": -Infinity,
                  "nonOverlapMeasure": 0,
                  "overlappingCoefficient": 0,
                  "probabilityOfSuperiority": 0,
                },
                "meanDifference": 100,
                "outcome": "greater",
                "pooledStDev": 0,
                "pooledVariance": 0,
                "stdevDifference": 0,
                "ttest": Object {
                  "degreesOfFreedom": NaN,
                  "greater": Object {
                    "confidenceInterval": Array [
                      NaN,
                      Infinity,
                    ],
                    "pValue": 0,
                    "rejected": true,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      NaN,
                    ],
                    "pValue": 1,
                    "rejected": false,
                  },
                  "tValue": -Infinity,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      NaN,
                      NaN,
                    ],
                    "pValue": 0,
                    "rejected": true,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two different datasets with two different data points',
    () => {
      const { originalResult, ...result } = compare({
        data1: [58, 59],
        data2: [158, 159],
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    58,
                    59,
                  ],
                  "dataCount": 2,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58.5,
                  "normalityProbability": 0.39632812046346777,
                  "stdev": 0.7071067811865476,
                  "variance": 0.5,
                },
                "data2": Object {
                  "data": Array [
                    158,
                    159,
                  ],
                  "dataCount": 2,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 158.5,
                  "normalityProbability": 0.39632812046338406,
                  "stdev": 0.7071067811865476,
                  "variance": 0.5,
                },
                "effectSize": Object {
                  "cohensD": -0,
                  "nonOverlapMeasure": 0.5,
                  "overlappingCoefficient": 1,
                  "probabilityOfSuperiority": 0.5,
                },
                "meanDifference": 100,
                "outcome": "greater",
                "pooledStDev": 0.7071067811865476,
                "pooledVariance": 0.5,
                "stdevDifference": 0,
                "ttest": Object {
                  "degreesOfFreedom": 2.000000000000001,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -102.06474160483504,
                      Infinity,
                    ],
                    "pValue": 0.9999750018748438,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      -97.93525839516495,
                    ],
                    "pValue": 0.000024998125156236253,
                    "rejected": true,
                  },
                  "tValue": -141.42135623730948,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -103.04243492229665,
                      -96.95756507770334,
                    ],
                    "pValue": 0.000049996250312472505,
                    "rejected": true,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two different datasets of 3 different data points',
    () => {
      const { originalResult, ...result } = compare({
        data1: [57, 58, 59],
        data2: [157, 158, 159],
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    57,
                    58,
                    59,
                  ],
                  "dataCount": 3,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 58,
                  "modalityCount": 1,
                  "normalityProbability": 1,
                  "stdev": 1,
                  "variance": 1,
                },
                "data2": Object {
                  "data": Array [
                    157,
                    158,
                    159,
                  ],
                  "dataCount": 3,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 158,
                  "modalityCount": 1,
                  "normalityProbability": 0,
                  "stdev": 1,
                  "variance": 1,
                },
                "denoiseSettings": Object {
                  "bandwidth": 0.539154780286722,
                  "kernelStretchFactor": 0.8,
                  "threshold": 1,
                },
                "effectSize": Object {
                  "cohensD": -0,
                  "nonOverlapMeasure": 0.5,
                  "overlappingCoefficient": 1,
                  "probabilityOfSuperiority": 0.5,
                },
                "meanDifference": 100,
                "outcome": "greater",
                "pooledStDev": 1,
                "pooledVariance": 1,
                "stdevDifference": 0,
                "ttest": Object {
                  "degreesOfFreedom": 4,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -101.74064561209747,
                      Infinity,
                    ],
                    "pValue": 0.9999999866725905,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      -98.25935438790253,
                    ],
                    "pValue": 1.3327409480817988e-8,
                    "rejected": true,
                  },
                  "tValue": -122.47448713915891,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -102.26695793552753,
                      -97.73304206447249,
                    ],
                    "pValue": 2.6654818961635977e-8,
                    "rejected": true,
                  },
                },
              }
          `)
    },
  )

  it.concurrent(
    'should compare two different datasets of 4 mixed data points',
    () => {
      const { originalResult, ...result } = compare({
        data1: [55, 56, 57, 58],
        data2: [158, 158, 158, 158],
        noiseValuesPerSample: 2,
        random: getStableRandom(5_000),
        iterations: 15,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchInlineSnapshot(`
              Object {
                "data1": Object {
                  "data": Array [
                    55,
                    56,
                    57,
                    58,
                  ],
                  "dataCount": 4,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 56.5,
                  "modalityCount": 1,
                  "normalityProbability": 0.02812294292355122,
                  "stdev": 1.2909944487358056,
                  "variance": 1.6666666666666667,
                },
                "data2": Object {
                  "data": Array [
                    158,
                    158,
                    158,
                    158,
                  ],
                  "dataCount": 4,
                  "discardedCount": 0,
                  "discardedData": Array [],
                  "mean": 158,
                  "modalityCount": 1,
                  "normalityProbability": 0,
                  "stdev": 0,
                  "variance": 0,
                },
                "denoiseSettings": Object {
                  "bandwidth": 0,
                  "kernelStretchFactor": 0.8,
                  "threshold": 0,
                },
                "effectSize": Object {
                  "cohensD": -44.926606816006036,
                  "nonOverlapMeasure": 0,
                  "overlappingCoefficient": 0,
                  "probabilityOfSuperiority": 0,
                },
                "meanDifference": 101.5,
                "outcome": "greater",
                "pooledStDev": 0.9128709291752769,
                "pooledVariance": 0.8333333333333334,
                "stdevDifference": 1.2909944487358056,
                "ttest": Object {
                  "degreesOfFreedom": 3,
                  "greater": Object {
                    "confidenceInterval": Array [
                      -103.0190895650935,
                      Infinity,
                    ],
                    "pValue": 0.9999997164285319,
                    "rejected": false,
                  },
                  "less": Object {
                    "confidenceInterval": Array [
                      -Infinity,
                      -99.9809104349065,
                    ],
                    "pValue": 2.8357146813359903e-7,
                    "rejected": true,
                  },
                  "tValue": -157.24312385602113,
                  "twoSided": Object {
                    "confidenceInterval": Array [
                      -103.55426025676053,
                      -99.44573974323947,
                    ],
                    "pValue": 5.671429362671981e-7,
                    "rejected": true,
                  },
                },
              }
          `)
    },
  )
})
