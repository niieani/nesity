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
          "rejectedCount": 3,
          "rejectedData": Array [
            1448.5129499999998,
            1585.888,
            1604.7237,
          ],
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
          "rejectedCount": 6,
          "rejectedData": Array [
            1445.1730499999999,
            1474.51955,
            1944.3399499999998,
            2094.8806,
            2445.73,
            4040.1620000000003,
          ],
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

  it('should compare two small datasets with noise iterations (equal 1)', () => {
    const { originalResult, ...result } = compare({
      data1: REAL_WORLD_DATA_3_SIMILAR.data1,
      data2: REAL_WORLD_DATA_3_SIMILAR.data2,
      noiseValuesPerSample: 2,
      random: getStableRandom(5_000),
      iterations: 15,
    })

    expect(result).toMatchInlineSnapshot(`
      Object {
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
          ],
          "mean": 274.73454545454547,
          "modalityCount": 1,
          "normalityProbability": 0.3097986213870877,
          "rejectedCount": 5,
          "rejectedData": Array [
            220.648,
            223.675,
            307.04,
            308.893,
            319.635,
          ],
          "stdev": 8.070541597236659,
          "validCount": 11,
          "variance": 65.13364167272724,
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
          ],
          "mean": 278.09672727272726,
          "modalityCount": 1,
          "normalityProbability": 0.6819670385723727,
          "rejectedCount": 5,
          "rejectedData": Array [
            29.341,
            198.564,
            296.633,
            298.389,
            302.163,
          ],
          "stdev": 5.16563374797147,
          "validCount": 11,
          "variance": 26.68377201818178,
        },
        "denoiseSettings": Object {
          "bandwidth": 6.318408872379358,
          "kernelStretchFactor": 0.8,
          "threshold": 26.341152270971367,
        },
        "effectSize": Object {
          "cohensD": -0.4103746369321459,
          "nonOverlapMeasure": 0.3407655743713765,
          "overlappingCoefficient": 0.8374257770558767,
          "probabilityOfSuperiority": 0.3858397695786626,
        },
        "meanDifference": 3.3621818181817957,
        "outcome": "similar",
        "pooledStDev": 6.775596419906848,
        "pooledVariance": 45.9087068454545,
        "ttest": Object {
          "degreesOfFreedom": 17.01600999028682,
          "greater": Object {
            "confidenceInterval": Array [
              -8.387849352936586,
              Infinity,
            ],
            "pValue": 0.8697052977670966,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              1.6634857165729948,
            ],
            "pValue": 0.13029470223290343,
            "rejected": false,
          },
          "tValue": -1.1637374490796852,
          "twoSided": Object {
            "confidenceInterval": Array [
              -9.457263831858763,
              2.7329001954951715,
            ],
            "pValue": 0.26058940446580686,
            "rejected": false,
          },
        },
      }
    `)
  })

  it('should compare two small datasets with noise iterations (equal)', () => {
    const { originalResult, ...result } = compare({
      data1: REAL_WORLD_DATA_4_SIMILAR.data1,
      data2: REAL_WORLD_DATA_4_SIMILAR.data2,
      noiseValuesPerSample: 2,
      random: getStableRandom(5_000),
      iterations: 15,
    })

    // expect(result.outcome).toBe('similar')
    expect(result).toMatchInlineSnapshot(`
      Object {
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
          ],
          "mean": 274.7600909090909,
          "modalityCount": 1,
          "normalityProbability": 0.31931801360806844,
          "rejectedCount": 5,
          "rejectedData": Array [
            220.604,
            223.656,
            307.098,
            309,
            319.647,
          ],
          "stdev": 8.079851934961999,
          "validCount": 11,
          "variance": 65.28400729090916,
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
          ],
          "mean": 278.0945454545455,
          "modalityCount": 1,
          "normalityProbability": 0.6789762980636239,
          "rejectedCount": 5,
          "rejectedData": Array [
            198.567,
            296.697,
            298.422,
            302.151,
            3434.452,
          ],
          "stdev": 5.1751151941505,
          "validCount": 11,
          "variance": 26.78181727272737,
        },
        "denoiseSettings": Object {
          "bandwidth": 5.3031931238020755,
          "kernelStretchFactor": 0.8,
          "threshold": 562.3873600000004,
        },
        "effectSize": Object {
          "cohensD": -0.4064409164536044,
          "nonOverlapMeasure": 0.34220933049717817,
          "overlappingCoefficient": 0.8389627231057736,
          "probabilityOfSuperiority": 0.38690412993858336,
        },
        "meanDifference": 3.334454545454605,
        "outcome": "similar",
        "pooledStDev": 6.784755874887339,
        "pooledVariance": 46.03291228181826,
        "ttest": Object {
          "degreesOfFreedom": 17.0228177487465,
          "greater": Object {
            "confidenceInterval": Array [
              -8.366800257585645,
              Infinity,
            ],
            "pValue": 0.8674944246346488,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              1.6978911666765473,
            ],
            "pValue": 0.1325055753653512,
            "rejected": false,
          },
          "tValue": -1.1525822327892221,
          "twoSided": Object {
            "confidenceInterval": Array [
              -9.437590332299354,
              2.768681241390258,
            ],
            "pValue": 0.2650111507307024,
            "rejected": false,
          },
        },
      }
    `)
  })

  it('should compare two small datasets with noise iterations (equal - different sample)', () => {
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
          "rejectedCount": 2,
          "rejectedData": Array [
            10789.819000000023,
            12178.027000000016,
          ],
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
        "data1": Object {
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
          "modalityCount": 2,
          "normalityProbability": 0.709709919769268,
          "rejectedCount": 9,
          "rejectedData": Array [
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
          "stdev": 34.35113648220454,
          "validCount": 7,
          "variance": 1180.0005776190437,
        },
        "data2": Object {
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
          "modalityCount": 2,
          "normalityProbability": 0.7795235585319694,
          "rejectedCount": 7,
          "rejectedData": Array [
            563.563,
            567.498,
            578.969,
            579.425,
            581.83,
            601.984,
            633.422,
          ],
          "stdev": 32.71913508093459,
          "validCount": 9,
          "variance": 1070.5418004444446,
        },
        "denoiseSettings": Object {
          "bandwidth": 138.94510302889046,
          "kernelStretchFactor": 0.8,
          "threshold": 268.7971949089747,
        },
        "effectSize": Object {
          "cohensD": -0.2792286390123455,
          "nonOverlapMeasure": 0.39003468329982593,
          "overlappingCoefficient": 0.888964726108687,
          "probabilityOfSuperiority": 0.4217398685214674,
        },
        "meanDifference": 12.469349206349307,
        "outcome": "similar",
        "pooledStDev": 33.42832189847172,
        "pooledVariance": 1117.4527049478443,
        "ttest": Object {
          "degreesOfFreedom": 12.709038007575328,
          "greater": Object {
            "confidenceInterval": Array [
              -42.5507219349448,
              Infinity,
            ],
            "pValue": 0.7622682848610207,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              17.612023522246187,
            ],
            "pValue": 0.2377317151389793,
            "rejected": false,
          },
          "tValue": -0.7353757503872428,
          "twoSided": Object {
            "confidenceInterval": Array [
              -49.18692953840577,
              24.248231125707157,
            ],
            "pValue": 0.4754634302779586,
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

    expect(result.outcome).toBe('greater')
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
          ],
          "mean": 32.05318181818182,
          "modalityCount": 1,
          "normalityProbability": 0.9999253355179418,
          "rejectedCount": 5,
          "rejectedData": Array [
            578.245,
            586.523,
            593.91,
            608.943,
            706.821,
          ],
          "stdev": 38.840408851653926,
          "validCount": 11,
          "variance": 1508.5773597636367,
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
          ],
          "mean": 67.06411111111112,
          "modalityCount": 2,
          "normalityProbability": 0.9968319858295895,
          "rejectedCount": 7,
          "rejectedData": Array [
            566.367,
            607.782,
            609.666,
            610.453,
            612.29,
            621.299,
            625.553,
          ],
          "stdev": 36.47102519276241,
          "validCount": 9,
          "variance": 1330.1356786111107,
        },
        "denoiseSettings": Object {
          "bandwidth": 20.433103773604955,
          "kernelStretchFactor": 1.4,
          "threshold": 39.5289999999999,
        },
        "effectSize": Object {
          "cohensD": -0.7461568176129151,
          "nonOverlapMeasure": 0.22778634513148888,
          "overlappingCoefficient": 0.7090900877504615,
          "probabilityOfSuperiority": 0.2988841418543436,
        },
        "meanDifference": 35.0109292929293,
        "outcome": "greater",
        "pooledStDev": 37.80568668756156,
        "pooledVariance": 1429.2699459180694,
        "ttest": Object {
          "degreesOfFreedom": 17.60694796400012,
          "greater": Object {
            "confidenceInterval": Array [
              -64.3174595348114,
              Infinity,
            ],
            "pValue": 0.9734870325826235,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              -5.704399051047179,
            ],
            "pValue": 0.026512967417376555,
            "rejected": true,
          },
          "tValue": -2.074100454074408,
          "twoSided": Object {
            "confidenceInterval": Array [
              -70.53144089906841,
              0.5095823132098385,
            ],
            "pValue": 0.05302593483475311,
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
})
