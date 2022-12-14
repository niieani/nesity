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
  REAL_WORLD_DATA_10_SIMILAR_NOISY,
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
          "dataCount": 13,
          "discardedCount": 3,
          "discardedData": Array [
            1448.5129499999998,
            1585.888,
            1604.7237,
          ],
          "mean": 1262.0372269230768,
          "meanDistanceRatio": 1.0106527356151334,
          "modalityCount": 1,
          "noiseCount": 0,
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
          "meanDistanceRatio": 1.0160390885527708,
          "modalityCount": 1,
          "noiseCount": 6,
          "normalityProbability": 0.7638960322720459,
          "stdev": 63.500249238291225,
          "variance": 4032.2816533251057,
        },
        "denoiseSettings": Object {
          "bandwidth": 34.6006685881664,
          "kernelStretchFactor": 0.8,
          "shouldSplit1": true,
          "shouldSplit2": true,
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
            "dataCount": 11,
            "discardedCount": 0,
            "discardedData": Array [],
            "mean": 274.73454545454547,
            "meanDistanceRatio": 1.0103820195396211,
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
            "meanDistanceRatio": 1.0204054202216892,
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
            "meanDistanceRatio": 1.0050715659923473,
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
            "meanDistanceRatio": 1.0092838461224174,
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
          "mean": 282.6891428571428,
          "meanDistanceRatio": 1.01252989111435,
          "modalityCount": 2,
          "normalityProbability": 0.4576989168041403,
          "representativeMean": 274.73454545454547,
          "representativeStdev": 8.070541597236659,
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
          "mean": 282.58921428571426,
          "meanDistanceRatio": 1.0059741974487908,
          "modalityCount": 2,
          "normalityProbability": 0.5358312445925786,
          "representativeMean": 278.09672727272726,
          "representativeStdev": 5.16563374797147,
          "stdev": 4.664219557052155,
          "variance": 22.67680344285713,
        },
        "denoiseSettings": Object {
          "bandwidth": 4.7283188882868155,
          "kernelStretchFactor": 0.8,
          "shouldSplit1": true,
          "shouldSplit2": true,
          "threshold": 66.03239008837507,
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
          "cohensD": 0.013383243968940767,
          "nonOverlapMeasure": 0.505338982489052,
          "overlappingCoefficient": 0.9946608979774366,
          "probabilityOfSuperiority": 0.5037752870709042,
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
            "dataCount": 11,
            "discardedCount": 0,
            "discardedData": Array [],
            "mean": 274.7600909090909,
            "meanDistanceRatio": 1.01038887356709,
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
            "meanDistanceRatio": 1.0203248866763825,
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
            "meanDistanceRatio": 1.0050824619112118,
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
            "meanDistanceRatio": 1.0091548699009703,
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
          "mean": 282.7218571428571,
          "meanDistanceRatio": 1.012518019233367,
          "modalityCount": 2,
          "normalityProbability": 0.46517843926348235,
          "representativeMean": 274.7600909090909,
          "representativeStdev": 8.079851934961999,
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
          "mean": 282.5935714285714,
          "meanDistanceRatio": 1.00595512076616,
          "modalityCount": 2,
          "normalityProbability": 0.5334813770499902,
          "representativeMean": 278.0945454545455,
          "representativeStdev": 5.1751151941505,
          "stdev": 4.663523368696174,
          "variance": 22.708112928571506,
        },
        "denoiseSettings": Object {
          "bandwidth": 5.3031931238020755,
          "kernelStretchFactor": 0.8,
          "shouldSplit1": true,
          "shouldSplit2": true,
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
          "cohensD": 0.01717674138178567,
          "nonOverlapMeasure": 0.5068521914294575,
          "overlappingCoefficient": 0.9931475558628949,
          "probabilityOfSuperiority": 0.504845350151967,
        },
        "meanDifference": -0.12828571428566526,
        "mergedFromMultipleModalities": true,
        "outcome": "similar",
        "outcomeFrequencies": Object {
          "greater": 0.09836065573770492,
          "similar": 0.9016393442622951,
        },
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
        "ttestAdjusted": Object {
          "greater": Object {
            "pValue": 0.37816976396170277,
            "rejected": false,
          },
          "less": Object {
            "pValue": 0.31139237009958604,
            "rejected": false,
          },
          "twoSided": Object {
            "pValue": 0.2604836291459586,
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
          "dataCount": 14,
          "discardedCount": 2,
          "discardedData": Array [
            10789.819000000023,
            12178.027000000016,
          ],
          "mean": 8884.876714285718,
          "meanDistanceRatio": 1.0093259016810512,
          "modalityCount": 1,
          "noiseCount": 2,
          "normalityProbability": 0.4830977036553685,
          "stdev": 315.04092536524325,
          "variance": 99250.78465498876,
        },
        "data2": Object {
          "data": Array [
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
          "dataCount": 13,
          "discardedCount": 3,
          "discardedData": Array [
            8447.615000000002,
            8504.422999999988,
            8551.507999999989,
          ],
          "mean": 9004.109,
          "meanDistanceRatio": 1.0075729245816964,
          "modalityCount": 1,
          "noiseCount": 0,
          "normalityProbability": 0.48236056387847337,
          "stdev": 264.57079484893745,
          "variance": 69997.70548699856,
        },
        "denoiseSettings": Object {
          "bandwidth": 161.37417144278757,
          "kernelStretchFactor": 0.8,
          "shouldSplit1": true,
          "shouldSplit2": true,
          "threshold": 312.1875018910312,
        },
        "effectSize": Object {
          "cohensD": -0.35177594218517105,
          "nonOverlapMeasure": 0.3625031510819295,
          "overlappingCoefficient": 0.8603819557030646,
          "probabilityOfSuperiority": 0.4017797327550121,
        },
        "meanDifference": 119.23228571428263,
        "outcome": "similar",
        "pooledStDev": 291.9063319874262,
        "pooledVariance": 85209.30665435348,
        "stdevDifference": 50.4701305163058,
        "ttest": Object {
          "degreesOfFreedom": 24.768125941714196,
          "greater": Object {
            "confidenceInterval": Array [
              -310.0765398756139,
              Infinity,
            ],
            "pValue": 0.8519941372426528,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              71.61196844704497,
            ],
            "pValue": 0.1480058627573472,
            "rejected": false,
          },
          "tValue": -1.0675662075271293,
          "twoSided": Object {
            "confidenceInterval": Array [
              -349.36331456819096,
              110.8987431396221,
            ],
            "pValue": 0.2960117255146944,
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
            "meanDistanceRatio": 1.0212701020134594,
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
            "meanDistanceRatio": 1.0149741103064052,
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
            "meanDistanceRatio": 1.0198328140594426,
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
            "meanDistanceRatio": 1.0111993604686127,
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
          "mean": 798.5249375000001,
          "meanDistanceRatio": 1.0185156056416231,
          "modalityCount": 2,
          "normalityProbability": 0.3224587211791987,
          "representativeMean": 1095.9214285714286,
          "representativeStdev": 34.35113648220454,
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
          "mean": 880.1380000000001,
          "meanDistanceRatio": 1.0149764964146009,
          "modalityCount": 2,
          "normalityProbability": 0.8156133365701609,
          "representativeMean": 1108.3907777777779,
          "representativeStdev": 32.71913508093459,
          "stdev": 28.906014485114653,
          "variance": 854.2518160000002,
        },
        "denoiseSettings": Object {
          "bandwidth": 138.94510302889046,
          "kernelStretchFactor": 0.8,
          "shouldSplit1": true,
          "shouldSplit2": true,
          "threshold": 268.7971949089747,
        },
        "discardedModalities1": Array [],
        "discardedModalities2": Array [],
        "effectSize": Object {
          "cohensD": -2.3388505179729644,
          "nonOverlapMeasure": 0.00967158557477793,
          "overlappingCoefficient": 0.24223233796328647,
          "probabilityOfSuperiority": 0.049082344146644474,
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
            "meanDistanceRatio": 1.4799130718600582,
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
            "meanDistanceRatio": 1.017407402892384,
            "normalityProbability": 0.11204146205647347,
            "stdev": 13.036806776073131,
            "variance": 169.9583309166663,
          },
        ],
        "comparedModalities2": Array [
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
            "meanDistanceRatio": 1.093627581103284,
            "normalityProbability": 0.01545389028355526,
            "stdev": 3.1751525422673255,
            "variance": 10.081593666666661,
          },
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
            "meanDistanceRatio": 1.0170140719706773,
            "normalityProbability": 0.9832576799307058,
            "stdev": 19.341509713566836,
            "variance": 374.09399800000034,
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
          "mean": 185.21514285714287,
          "meanDistanceRatio": 1.3477685950121514,
          "modalityCount": 2,
          "normalityProbability": 0.7462881200270457,
          "representativeMean": 22.5391,
          "representativeStdev": 23.871928621290742,
          "stdev": 20.77617952265714,
          "variance": 455.60879176190474,
        },
        "data2": Object {
          "data": Array [
            24.992,
            28.01,
            29.373,
            32.647,
            566.367,
            607.782,
            609.666,
            610.453,
            612.29,
            621.299,
            625.553,
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
          "mean": 397.1301818181818,
          "meanDistanceRatio": 1.0448735298370797,
          "modalityCount": 3,
          "normalityProbability": 0.6313290291499237,
          "representativeMean": 28.755499999999998,
          "representativeStdev": 3.1751525422673255,
          "stdev": 13.462834378548832,
          "variance": 241.72585096969718,
        },
        "denoiseSettings": Object {
          "bandwidth": 20.433103773604955,
          "kernelStretchFactor": 0.8,
          "shouldSplit1": true,
          "shouldSplit2": true,
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
          "cohensD": -9.296895627936468,
          "nonOverlapMeasure": 0,
          "overlappingCoefficient": 0.000003344422098261468,
          "probabilityOfSuperiority": 2.4507396112483093e-11,
        },
        "meanDifference": 10.60011980519479,
        "mergedFromMultipleModalities": true,
        "outcome": "similar",
        "outcomeFrequencies": Object {
          "greater": 0.04411764705882353,
          "similar": 0.9558823529411765,
        },
        "pooledStDev": 19.308332078922085,
        "pooledVariance": 372.8116876699316,
        "stdevDifference": 7.313345144108309,
        "ttest": Object {
          "degreesOfFreedom": 9.194972964901895,
          "greater": Object {
            "confidenceInterval": Array [
              -26.48361606468466,
              Infinity,
            ],
            "pValue": 0.8482055090001916,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              5.283376454295078,
            ],
            "pValue": 0.1517944909998084,
            "rejected": false,
          },
          "tValue": -1.1745068864994517,
          "twoSided": Object {
            "confidenceInterval": Array [
              -30.195099052095934,
              8.994859441706351,
            ],
            "pValue": 0.3035889819996168,
            "rejected": false,
          },
        },
        "ttestAdjusted": Object {
          "greater": Object {
            "pValue": 0.44281317013980587,
            "rejected": false,
          },
          "less": Object {
            "pValue": 0.1517944909998084,
            "rejected": false,
          },
          "twoSided": Object {
            "pValue": 0.3189509897496252,
            "rejected": false,
          },
        },
      }
    `)
  })

  it('should compare two small datasets with noise iterations (similar 2)', () => {
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
          "meanDistanceRatio": 1.0268959601086594,
          "modalityCount": 1,
          "noiseCount": 2,
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
          "meanDistanceRatio": 1.0312400065842302,
          "modalityCount": 1,
          "noiseCount": 2,
          "normalityProbability": 0.7442370363176855,
          "stdev": 58.075970369898414,
          "variance": 3372.8183344053186,
        },
        "denoiseSettings": Object {
          "bandwidth": 31.53491196084364,
          "kernelStretchFactor": 0.9,
          "shouldSplit1": true,
          "shouldSplit2": true,
          "threshold": 117.00142369724773,
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
  })

  it('should compare two datasets with noise iterations (similar 3)', () => {
    const { originalResult, ...result } = compare({
      ...REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY,
      noiseValuesPerSample: 3,
      random: getStableRandom(5_000),
      iterations: 15,
    })

    expect(result.outcome).toBe('similar')
    expect(result).toMatchInlineSnapshot(`
      Object {
        "comparedModalities1": Array [
          Object {
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
            ],
            "dataCount": 12,
            "discardedCount": 0,
            "discardedData": Array [],
            "mean": 628.4500000000504,
            "meanDistanceRatio": 1.0551934381027104,
            "normalityProbability": 0.985303543406668,
            "stdev": 97.05314851337945,
            "variance": 9419.313636360088,
          },
          Object {
            "data": Array [
              1904.0999999999767,
              1944.1999999999534,
              1966.7999999999884,
              2314.1999999999534,
            ],
            "dataCount": 4,
            "discardedCount": 0,
            "discardedData": Array [],
            "mean": 2032.324999999968,
            "meanDistanceRatio": 1.069772076504024,
            "normalityProbability": 0.9564785698274588,
            "stdev": 189.69687003215546,
            "variance": 35984.90249999648,
          },
        ],
        "comparedModalities2": Array [
          Object {
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
            ],
            "dataCount": 11,
            "discardedCount": 0,
            "discardedData": Array [],
            "mean": 633.3636363636629,
            "meanDistanceRatio": 1.0377883680025721,
            "normalityProbability": 0.9380714214119303,
            "stdev": 84.21425381403726,
            "variance": 7092.04054545509,
          },
          Object {
            "data": Array [
              1314,
              1854.8000000000466,
              1911.9000000000233,
              1930.6999999999534,
              1995.4000000000233,
            ],
            "dataCount": 5,
            "discardedCount": 0,
            "discardedData": Array [],
            "mean": 1801.3600000000092,
            "meanDistanceRatio": 1.1214242586088297,
            "normalityProbability": 0.9834759275748338,
            "stdev": 277.0266467327679,
            "variance": 76743.76300000178,
          },
        ],
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
          "meanDistanceRatio": 1.0588380977030387,
          "modalityCount": 2,
          "normalityProbability": 0.9780973000118657,
          "representativeMean": 628.4500000000504,
          "representativeStdev": 97.05314851337945,
          "stdev": 120.21407889307345,
          "variance": 16060.710852269187,
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
          "meanDistanceRatio": 1.0639245838170277,
          "modalityCount": 2,
          "normalityProbability": 0.9522603295878376,
          "representativeMean": 633.3636363636629,
          "representativeStdev": 84.21425381403726,
          "stdev": 144.4681266011406,
          "variance": 28858.20381250093,
        },
        "denoiseSettings": Object {
          "bandwidth": 215.16556062035738,
          "kernelStretchFactor": 0.8,
          "shouldSplit1": true,
          "shouldSplit2": true,
          "threshold": 638.9659461126369,
        },
        "discardedModalities1": Array [],
        "discardedModalities2": Array [],
        "effectSize": Object {
          "cohensD": -0.11133343920996386,
          "nonOverlapMeasure": 0.45567596978574065,
          "overlappingCoefficient": 0.9556073122824297,
          "probabilityOfSuperiority": 0.4686258272486759,
        },
        "meanDifference": -61.427230113641954,
        "mergedFromMultipleModalities": true,
        "outcome": "similar",
        "pooledStDev": 150.48215753055283,
        "pooledVariance": 22644.87973505012,
        "stdevDifference": -24.254047708067148,
        "ttest": Object {
          "degreesOfFreedom": 16.996459570382118,
          "greater": Object {
            "confidenceInterval": Array [
              -68.6606942802218,
              Infinity,
            ],
            "pValue": 0.42181354321717063,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              191.5151545075057,
            ],
            "pValue": 0.5781864567828294,
            "rejected": false,
          },
          "tValue": 0.3229231170182037,
          "twoSided": Object {
            "confidenceInterval": Array [
              -99.16572799334836,
              222.02018822063224,
            ],
            "pValue": 0.696777695923371,
            "rejected": false,
          },
        },
      }
    `)
  })

  it('should compare two datasets with noise iterations (similar 4)', () => {
    const { originalResult, ...result } = compare({
      ...REAL_WORLD_DATA_10_SIMILAR_NOISY,
      noiseValuesPerSample: 3,
      random: getStableRandom(5_000),
      iterations: 15,
    })

    expect(result.outcome).toBe('similar')
    expect(result).toMatchInlineSnapshot(`
      Object {
        "data1": Object {
          "data": Array [
            558.3779999999969,
            561.0819999999945,
            568.3039999999922,
            569.9889999999938,
            571.4279999999931,
            578.8069999999934,
            587.9529999999946,
            605.6259999999933,
            609.3809999999942,
            613.0419999999917,
            613.2369999999943,
            615.233999999996,
            621.3489999999929,
          ],
          "dataCount": 13,
          "discardedCount": 3,
          "discardedData": Array [
            698.2099999999915,
            1482.7349999999942,
            1759.8599999999988,
          ],
          "mean": 590.2930769230709,
          "meanDistanceRatio": 1.008974899977282,
          "modalityCount": 1,
          "noiseCount": 3,
          "normalityProbability": 0.9292350142115805,
          "stdev": 23.257320874158665,
          "variance": 540.9029742435764,
        },
        "data2": Object {
          "data": Array [
            557.2959999999936,
            559.6269999999946,
            568.4069999999929,
            571.6659999999926,
            573.8239999999945,
            576.2269999999933,
            577.3689999999933,
            583.5359999999945,
            585.4599999999919,
            586.1419999999941,
            605.9639999999927,
            629.8679999999944,
            632.3439999999922,
          ],
          "dataCount": 13,
          "discardedCount": 3,
          "discardedData": Array [
            1458.1829999999989,
            1524.4450000000002,
            1692.5979999999925,
          ],
          "mean": 585.2099999999934,
          "meanDistanceRatio": 1.0106574692714307,
          "modalityCount": 1,
          "noiseCount": 3,
          "normalityProbability": 0.9562910706807728,
          "stdev": 23.84269879858383,
          "variance": 568.4742859999907,
        },
        "denoiseSettings": Object {
          "bandwidth": 17.6269691358854,
          "kernelStretchFactor": 0.9,
          "shouldSplit1": true,
          "shouldSplit2": true,
          "threshold": 354.7947910506342,
        },
        "effectSize": Object {
          "cohensD": 0.18467931381003283,
          "nonOverlapMeasure": 0.5732597138716617,
          "overlappingCoefficient": 0.9264281812921558,
          "probabilityOfSuperiority": 0.5519493800562874,
        },
        "meanDifference": -5.083076923077442,
        "outcome": "similar",
        "pooledStDev": 23.551828594013323,
        "pooledVariance": 554.6886301217836,
        "stdevDifference": -0.5853779244251633,
        "ttest": Object {
          "degreesOfFreedom": 23.985185076517052,
          "greater": Object {
            "confidenceInterval": Array [
              -10.722079317438691,
              Infinity,
            ],
            "pValue": 0.29361872817948476,
            "rejected": false,
          },
          "less": Object {
            "confidenceInterval": Array [
              -Infinity,
              20.88823316359358,
            ],
            "pValue": 0.7063812718205152,
            "rejected": false,
          },
          "tValue": 0.5502483239550531,
          "twoSided": Object {
            "confidenceInterval": Array [
              -13.983402002509251,
              24.149555848664132,
            ],
            "pValue": 0.5872374563589695,
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
          "dataCount": 16,
          "discardedCount": 0,
          "discardedData": Array [],
          "mean": 1734.6108124999996,
          "meanDistanceRatio": 1.0400306247983537,
          "modalityCount": 1,
          "noiseCount": 0,
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
          "meanDistanceRatio": 1.0463584791919407,
          "modalityCount": 1,
          "noiseCount": 0,
          "normalityProbability": 0.748517729160048,
          "stdev": 377.4615563315411,
          "variance": 142477.22650822916,
        },
        "denoiseSettings": Object {
          "bandwidth": 192.22324701802228,
          "kernelStretchFactor": 0.8,
          "shouldSplit1": false,
          "shouldSplit2": true,
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
          "dataCount": 6,
          "discardedCount": 0,
          "discardedData": Array [],
          "mean": 29.395833333333332,
          "meanDistanceRatio": 1.4339073963755762,
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
          "meanDistanceRatio": 1.7563864375290295,
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

  it('should compare two identical datasets of exactly one data point', () => {
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
          "meanDistanceRatio": 0,
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
          "meanDistanceRatio": 0,
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
          "dataCount": 1,
          "discardedCount": 0,
          "discardedData": Array [],
          "mean": 58,
          "meanDistanceRatio": 0,
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
          "meanDistanceRatio": 0,
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
  })

  it('should compare two identical datasets of exactly two data points', () => {
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
          "meanDistanceRatio": 1,
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
          "meanDistanceRatio": 1,
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
  })

  it('should compare two different datasets of exactly the same two data points', () => {
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
          "meanDistanceRatio": 1,
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
          "meanDistanceRatio": 1,
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
  })

  it('should compare two different datasets of exactly the same 3 data points', () => {
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
          "meanDistanceRatio": 1,
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
          "meanDistanceRatio": 1,
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
  })

  it('should compare two different datasets of 4 exactly the same data points', () => {
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
          "meanDistanceRatio": 1,
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
          "meanDistanceRatio": 1,
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
  })

  it('should compare two different datasets with two different data points', () => {
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
          "meanDistanceRatio": 1.0172413793103448,
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
          "meanDistanceRatio": 1.0063291139240507,
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
  })

  it('should compare two different datasets of 3 different data points', () => {
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
          "meanDistanceRatio": 1.0173926194797338,
          "modalityCount": 1,
          "noiseCount": 0,
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
          "meanDistanceRatio": 1.0063492703378216,
          "modalityCount": 1,
          "noiseCount": 0,
          "normalityProbability": 0,
          "stdev": 1,
          "variance": 1,
        },
        "denoiseSettings": Object {
          "bandwidth": 0.539154780286722,
          "kernelStretchFactor": 0.8,
          "shouldSplit1": true,
          "shouldSplit2": true,
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
  })

  it('should compare two different datasets of 4 mixed data points', () => {
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
          "meanDistanceRatio": 1.0178609402293612,
          "modalityCount": 1,
          "noiseCount": 0,
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
          "meanDistanceRatio": 1,
          "modalityCount": 1,
          "noiseCount": 0,
          "normalityProbability": 0,
          "stdev": 0,
          "variance": 0,
        },
        "denoiseSettings": Object {
          "bandwidth": 0,
          "kernelStretchFactor": 1,
          "shouldSplit1": true,
          "shouldSplit2": true,
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
  })
})
