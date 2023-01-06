import {
  REAL_WORLD_DATA_1,
  REAL_WORLD_DATA_2_SIMILAR,
  REAL_WORLD_DATA_3_SIMILAR,
  REAL_WORLD_DATA_4_SIMILAR,
  REAL_WORLD_DATA_5_BIMODAL,
  REAL_WORLD_DATA_6_GREATER,
  REAL_WORLD_DATA_7_BIMODAL,
} from './__fixtures__/testSamples'
import { compare } from './compare'
import { getStableRandom } from './utilities'

describe('compare', () => {
  it('should compare two datasets', () => {
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
          "mean": 1262.0372269230768,
          "modalityCount": 1,
          "normalityProbability": 0.7877846020925403,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 54.763117695107304,
          "validCount": 13,
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
          "mean": 1256.7755300000001,
          "modalityCount": 1,
          "normalityProbability": 0.7638960322720459,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 63.500249238291225,
          "validCount": 10,
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

  it('should compare two small datasets with noise iterations (similar 1)', () => {
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
            "mean": 274.73454545454547,
            "normalityProbability": 0.3097986213870877,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 8.070541597236659,
            "validCount": 11,
            "variance": 65.13364167272724,
          },
          Object {
            "data": Array [
              307.04,
              308.893,
              319.635,
            ],
            "mean": 311.856,
            "normalityProbability": 1,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 6.80022301104897,
            "validCount": 3,
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
            "mean": 278.09672727272726,
            "normalityProbability": 0.6819670385723727,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 5.16563374797147,
            "validCount": 11,
            "variance": 26.68377201818178,
          },
          Object {
            "data": Array [
              296.633,
              298.389,
              302.163,
            ],
            "mean": 299.06166666666667,
            "normalityProbability": 0,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 2.825700857014664,
            "validCount": 3,
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
          "mean": 274.73454545454547,
          "modalityCount": 1,
          "normalityProbability": 0.4576989168041403,
          "rejectedCount": 1,
          "rejectedData": Array [
            220.648,
            223.675,
          ],
          "stdev": 7.798330471625011,
          "validCount": 14,
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
          "mean": 278.09672727272726,
          "modalityCount": 1,
          "normalityProbability": 0.5358312445925786,
          "rejectedCount": 2,
          "rejectedData": Array [
            29.341,
            198.564,
          ],
          "stdev": 4.664219557052155,
          "validCount": 14,
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
        "outcome": "similar",
        "pooledStDev": 6.4715708117449,
        "pooledVariance": 41.88122877142854,
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
  })

  it('should compare two small datasets with noise iterations (similar)', () => {
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
            "mean": 274.7600909090909,
            "normalityProbability": 0.31931801360806844,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 8.079851934961999,
            "validCount": 11,
            "variance": 65.28400729090916,
          },
          Object {
            "data": Array [
              307.098,
              309,
              319.647,
            ],
            "mean": 311.91499999999996,
            "normalityProbability": 1,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 6.763303113124523,
            "validCount": 3,
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
            "mean": 278.0945454545455,
            "normalityProbability": 0.6789762980636239,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 5.1751151941505,
            "validCount": 11,
            "variance": 26.78181727272737,
          },
          Object {
            "data": Array [
              296.697,
              298.422,
              302.151,
            ],
            "mean": 299.09,
            "normalityProbability": 0,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 2.787686675363644,
            "validCount": 3,
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
          "mean": 274.7600909090909,
          "modalityCount": 1,
          "normalityProbability": 0.46517843926348235,
          "rejectedCount": 1,
          "rejectedData": Array [
            220.604,
            223.656,
          ],
          "stdev": 7.79773433028254,
          "validCount": 14,
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
          "mean": 278.0945454545455,
          "modalityCount": 1,
          "normalityProbability": 0.5334813770499902,
          "rejectedCount": 2,
          "rejectedData": Array [
            198.567,
            3434.452,
          ],
          "stdev": 4.663523368696174,
          "validCount": 14,
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
        "outcome": "similar",
        "pooledStDev": 6.473198779252367,
        "pooledVariance": 41.90230243571433,
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
  })

  it('should compare two small datasets with noise iterations (similar - different sample)', () => {
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
          "mean": 8884.876714285718,
          "modalityCount": 1,
          "normalityProbability": 0.4830977036553685,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 315.04092536524325,
          "validCount": 14,
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
          "mean": 8909.8101875,
          "modalityCount": 1,
          "normalityProbability": 0.19957423060483725,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 312.1875018910312,
          "validCount": 16,
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
  })

  it('should compare two small datasets with noise iterations (bimodal)', () => {
    const { originalResult, ...result } = compare({
      ...REAL_WORLD_DATA_5_BIMODAL,
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
            "mean": 567.2165555555556,
            "normalityProbability": 0.021263344498033687,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 30.750844805920003,
            "validCount": 9,
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
            "mean": 1095.9214285714286,
            "normalityProbability": 0.709709919769268,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 34.35113648220454,
            "validCount": 7,
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
            "mean": 586.6701428571429,
            "normalityProbability": 0.8620144797621213,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 24.003430861917582,
            "validCount": 7,
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
            "mean": 1108.3907777777779,
            "normalityProbability": 0.7795235585319694,
            "rejectedCount": 0,
            "rejectedData": Array [],
            "stdev": 32.71913508093459,
            "validCount": 9,
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
          "mean": 1095.9214285714286,
          "modalityCount": 2,
          "normalityProbability": 0.3224587211791987,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 32.32597241429448,
          "validCount": 16,
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
          "mean": 1108.3907777777779,
          "modalityCount": 2,
          "normalityProbability": 0.8156133365701609,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 28.906014485114653,
          "validCount": 16,
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
        "outcome": "similar",
        "pooledStDev": 30.860424077234526,
        "pooledVariance": 952.3657742267565,
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
  })

  it('should compare two small datasets with noise iterations (bimodal 2)', () => {
    const { originalResult, ...result } = compare({
      ...REAL_WORLD_DATA_7_BIMODAL,
      noiseValuesPerSample: 2,
      random: getStableRandom(5_000),
      iterations: 15,
    })

    expect(result.outcome).toBe('similar')
    expect(result).toMatchInlineSnapshot(`
      Object {
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
            127.194,
            578.245,
            586.523,
            593.91,
            608.943,
            706.821,
          ],
          "mean": 214.1891875,
          "modalityCount": 2,
          "normalityProbability": 0.9998758797125644,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 282.1191494129667,
          "validCount": 16,
          "variance": 79591.21446549584,
        },
        "data2": Object {
          "data": Array [
            24.992,
            28.01,
            29.373,
            32.647,
            93.469,
            95.761,
            98.026,
            99.019,
            102.28,
            566.367,
            607.782,
            609.666,
            610.453,
            612.29,
            621.299,
            625.553,
          ],
          "mean": 303.5616875,
          "modalityCount": 2,
          "normalityProbability": 0.9997518376975256,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 278.50414153993444,
          "validCount": 16,
          "variance": 77564.55685489583,
        },
        "effectSize": Object {
          "cohensD": -0.2819670870845634,
          "nonOverlapMeasure": 0.3889843737170023,
          "overlappingCoefficient": 0.8878829428357767,
          "probabilityOfSuperiority": 0.4209824237860587,
        },
        "meanDifference": 89.3725,
        "outcome": "similar",
        "pooledStDev": 280.3174729841075,
        "pooledVariance": 78577.88566019583,
        "ttest": Object {
          "degreesOfFreedom": 29.9950117393883,
          "greater": Object {
            "confidenceInterval": Array [
              -257.58415329369495,
              Infinity,
            ],
            "pValue": 0.8128198570420297,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              78.83915329369496,
            ],
            "pValue": 0.18718014295797025,
            "rejected": false,
          },
          "tValue": -0.9017761201803869,
          "twoSided": Object {
            "confidenceInterval": Array [
              -291.7778020294825,
              113.03280202948245,
            ],
            "pValue": 0.3743602859159405,
            "rejected": false,
          },
        },
      }
    `)
  })

  it('should compare two small datasets with noise iterations (greater)', () => {
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
          "mean": 1734.6108124999996,
          "modalityCount": 1,
          "normalityProbability": 0.997441432776035,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 389.9511438157723,
          "validCount": 16,
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
          "mean": 1989.0906874999998,
          "modalityCount": 1,
          "normalityProbability": 0.748517729160048,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 377.4615563315411,
          "validCount": 16,
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
  })

  it('should compare two dataset with varying lengths', () => {
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
          "mean": 29.395833333333332,
          "modalityCount": undefined,
          "normalityProbability": 0.9442472989953399,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 20.791395810927817,
          "validCount": 6,
          "variance": 432.28213976666683,
        },
        "data2": Object {
          "data": Array [
            30.142,
            52.941,
          ],
          "mean": 41.5415,
          "modalityCount": undefined,
          "normalityProbability": 0.39632812046348587,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 16.1213275042721,
          "validCount": 2,
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

  it('should compare two identical datasets of exactly one data point', () => {
    const { originalResult, ...result } = compare({
      data1: [58],
      data2: [58],
      noiseValuesPerSample: 2,
      random: getStableRandom(5_000),
      iterations: 15,
    })

    expect(result.outcome).toBe('similar')
    expect(result).toMatchInlineSnapshot(`
      Object {
        "data1": Object {
          "data": Array [
            58,
          ],
          "mean": 58,
          "normalityProbability": 1,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 0,
          "validCount": 1,
          "variance": 0,
        },
        "data2": Object {
          "data": Array [
            58,
          ],
          "mean": 58,
          "normalityProbability": 0,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 0,
          "validCount": 1,
          "variance": 0,
        },
        "effectSize": Object {
          "cohensD": NaN,
          "nonOverlapMeasure": NaN,
          "overlappingCoefficient": NaN,
          "probabilityOfSuperiority": NaN,
        },
        "meanDifference": 0,
        "outcome": "similar",
        "pooledStDev": NaN,
        "pooledVariance": NaN,
        "ttest": Object {
          "degreesOfFreedom": NaN,
          "greater": Object {
            "confidenceInterval": Array [
              NaN,
              Infinity,
            ],
            "pValue": NaN,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              NaN,
            ],
            "pValue": NaN,
            "rejected": false,
          },
          "tValue": NaN,
          "twoSided": Object {
            "confidenceInterval": Array [
              NaN,
              NaN,
            ],
            "pValue": NaN,
            "rejected": false,
          },
        },
      }
    `)
  })

  it('should compare two different datasets of exactly one data point', () => {
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
          "mean": 58,
          "normalityProbability": 1,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 0,
          "validCount": 1,
          "variance": 0,
        },
        "data2": Object {
          "data": Array [
            59,
          ],
          "mean": 59,
          "normalityProbability": 0,
          "rejectedCount": 0,
          "rejectedData": Array [],
          "stdev": 0,
          "validCount": 1,
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
        "ttest": Object {
          "degreesOfFreedom": NaN,
          "greater": Object {
            "confidenceInterval": Array [
              NaN,
              Infinity,
            ],
            "pValue": NaN,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              NaN,
            ],
            "pValue": NaN,
            "rejected": false,
          },
          "tValue": NaN,
          "twoSided": Object {
            "confidenceInterval": Array [
              NaN,
              NaN,
            ],
            "pValue": NaN,
            "rejected": false,
          },
        },
      }
    `)
  })
})
