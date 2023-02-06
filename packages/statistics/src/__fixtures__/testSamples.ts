/* eslint-disable no-magic-numbers */
export const UNIMODAL_SAMPLE = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1_000,
]
export const UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION = [
  299, 396, 436, 438, 452, 462, 471, 487, 494, 495, 497, 517, 521, 533, 564,
  571, 579, 637, 665, 691,
]
export const UNIMODAL_SAMPLE_REAL = [
  610.339, 625.33, 625.412, 630.126, 633.444, 635.897, 644.763, 645.87, 646.787,
  647.37, 647.749, 648.454, 653.721, 656.844, 658.291, 659.335, 668.991,
  670.003, 675.073, 675.171, 676.287, 679.074, 682.261, 683.17, 688.014,
  688.324, 692.376, 699.238, 699.913, 702.472, 719.186, 723.822,
]

export const BIMODAL_SAMPLE_1 = [100, 101, 150, 200, 300, 350, 380, 400]
export const BIMODAL_SAMPLE_2 = [800, 850, 860, 870, 900, 950, 1_000]
export const BIMODAL_SAMPLE = [
  ...BIMODAL_SAMPLE_1,
  // prettier-ignore
  ...BIMODAL_SAMPLE_2,
]
export const MULTIMODAL_SAMPLE_1 = [100, 101, 150, 200, 300, 350, 380, 400]
export const MULTIMODAL_SAMPLE_2 = [
  1_800, 1_850, 1_860, 1_870, 1_900, 1_950, 1_995,
]
export const MULTIMODAL_SAMPLE_3 = [
  3_700, 3_850, 3_860, 3_870, 3_900, 3_950, 3_995,
]
export const MULTIMODAL_SAMPLE_BEGINNING = [99, 99, 99, 99, 99, 99]
export const MULTIMODAL_SAMPLE = [
  ...MULTIMODAL_SAMPLE_1,
  ...MULTIMODAL_SAMPLE_2,
  ...MULTIMODAL_SAMPLE_3,
]
export const MULTIMODAL_SAMPLE_HEAVY_BEGINNING = [
  ...MULTIMODAL_SAMPLE_BEGINNING,
  ...MULTIMODAL_SAMPLE_1,
  ...MULTIMODAL_SAMPLE_2,
  ...MULTIMODAL_SAMPLE_3,
]

export const REAL_WORLD_DATA_1 = {
  sample1: [
    1_233.945_5, 1_190.69, 1_379.485_999_999_999_9, 1_478.47, 1_326.132,
    1_325.89, 1_158.262, 1_205.770_599_999_999_8, 1_208.974_950_000_000_3,
    1_475.394, 1_181.246, 1_230.560_75, 1_583.152, 1_207.528, 1_202.415,
    1_189.994_000_000_000_1, 1_623.005_6, 1_314.307_449_999_999_8,
    1_279.866_349_999_999_8, 1_297.476_999_999_999_9, 1_225.228_65, 1_304.083,
    1_322.948_600_000_000_2, 1_604.723_7, 1_219.817_95, 1_585.888,
    1_268.148_800_000_000_2, 1_319.122, 1_168.735_000_000_000_1, 1_237.119,
    1_240.996, 1_282.825, 1_448.512_949_999_999_8, 1_177.763, 1_313.175,
    1_326.521_95, 1_196.338, 1_167.914, 1_329.145_1, 1_286.184,
    1_383.109_150_000_000_2, 1_226.216_199_999_999_8, 1_240.622, 1_200.800_15,
    1_259.815, 1_849.554_500_000_000_2, 1_218.224, 1_232.166_500_000_000_3,
    1_336.104_349_999_999_8, 1_189.993, 1_334.06, 1_767.708_6, 1_517.053_95,
    1_163.125, 1_246.692_45, 1_273.966, 1_788.889_849_999_999_8,
    1_531.746_800_000_000_3, 1_200.101, 1_230.407_450_000_000_2, 1_660.609,
    1_220.075, 1_206.289, 4_282.457, 1_186.568, 1_266.851_999_999_999_9,
    1_498.098_349_999_999_8, 1_334.341_649_999_999_8, 1_201.336,
    1_280.541_100_000_000_4, 1_953.519_000_000_000_2, 1_347.024, 1_325.478,
    1_196.046, 1_904.043_2, 1_202.056_600_000_000_1, 1_457.215_399_999_999_8,
    1_190.786, 1_264.626_349_999_999_8, 1_931.878_000_000_000_2, 1_446.008_35,
    1_189.412, 1_457.070_15, 2_282.072_1, 1_194.201, 1_390.675_25,
    1_264.666_000_000_000_2, 1_750.005, 1_172.351_999_999_999_9, 1_251.106,
    1_377.593_1, 1_152.923, 2_610.365_7, 1_198.463, 1_247.081_999_999_999_9,
    1_242.358, 1_171.624, 1_320.793_999_999_999_9, 1_189.342, 1_522.434_45,
    1_626.438, 1_186.675, 1_223.336, 1_339.942, 1_197.019, 1_357.134, 1_249.156,
    1_144.523_000_000_000_1, 1_240.635, 1_245.627, 1_288.760_6, 1_679.195,
    1_176.548, 2_350.241_550_000_000_6, 1_724.980_7, 1_151.616, 1_192.566,
    1_306.525_8, 1_300.21, 1_200.034, 1_215.754_000_000_000_4, 1_715.064,
    1_171.639_999_999_999_9, 1_203.728_55, 1_205.985_999_999_999_9,
    1_305.656_299_999_999_9, 1_195.883, 1_491.682, 4_104.909_100_000_003,
    1_734.579, 1_195.96, 1_204.995, 1_333.825_95, 1_230.252, 1_209.637_95,
    4_025.297_000_000_000_5, 1_210.501_55, 1_341.312_55,
    1_245.991_799_999_999_8, 1_345.591_049_999_999_8, 1_323.029,
    1_483.770_599_999_999_8, 1_516.095, 2_377.553_6, 1_190.884, 1_238.76,
    1_220.251, 1_499.246, 2_559.279_25, 1_500.463_7, 1_234.968,
    1_954.662_000_000_000_3, 1_192.12, 1_265.298, 1_417.115,
    1_703.293_000_000_000_1, 1_199.162, 1_747.998, 1_261.113_35, 1_209.315_25,
    1_301.340_000_000_000_1, 1_510.641, 1_529.233_85, 1_402.976_999_999_999_9,
    1_609.178_899_999_999_9, 1_205.629_199_999_999_9, 1_185.633, 1_360.995_8,
    1_391.394, 1_209.384_45, 1_272.067_85, 1_205.956_65, 1_183.791, 1_463.607_4,
    1_433.480_300_000_000_2, 1_281.396_6, 1_232.336, 1_382.126_9, 1_159.813,
    1_579.818, 4_473.910_200_000_007_5, 1_376.949_85, 1_350.899_55,
    2_196.421_950_000_000_4, 1_540.930_75, 1_251.794_600_000_000_2, 1_150.531,
    1_467.307_3, 1_348.634, 1_274.422, 1_264.317_65, 1_176.92,
    1_221.772_399_999_999_8, 1_353.576_500_000_000_1, 1_640.877_799_999_999_8,
    1_660.786, 1_277.712, 1_242.306_75, 1_728.168_999_999_999_9, 1_201.592_5,
    1_608.976, 1_408.194_7, 1_289.843_150_000_000_2, 5_036.253_000_000_001,
    1_238.752, 2_247.815, 1_247.434, 1_400.774_6, 2_043.939_1, 1_304.821_7,
    1_204.947_000_000_000_1, 2_153.229_999_999_999_6, 1_171.631,
    1_324.606_649_999_999_7, 1_887.776_850_000_000_2, 1_242.326_050_000_000_1,
    1_166.456_999_999_999_9, 1_290.319_650_000_000_4, 1_168.618, 1_241.244_25,
    1_176.863, 1_226.369_299_999_999_8, 1_790.625, 1_151.092, 1_206.15,
    1_837.817, 4_040.206, 1_942.734, 2_374.997_000_000_000_3,
    1_230.060_299_999_999_9, 1_178.601, 2_450.875_449_999_999_5, 2_368.808,
    1_239.837_9, 4_699.766_400_000_002, 1_220.474, 1_242.233_35, 1_416.165_35,
    1_159.539, 1_156.194, 1_734.606_200_000_000_2, 1_265.051,
    1_244.373_149_999_999_7, 1_182.731, 1_236.496_3, 1_173.272, 1_255.748,
    1_257.867_5, 1_177.165, 1_208.416, 1_182.038, 1_175.171, 1_240.643,
    1_161.577, 1_168.302_999_999_999_9, 1_235.942,
  ],
  sample2: [
    1_332.683, 1_406.436_800_000_000_4, 1_190.499, 1_242.859_75, 1_486.946,
    1_208.641, 1_362.563, 1_228.587, 1_292.849_55, 1_206.48,
    1_252.404_299_999_999_7, 1_376.784, 1_675.171, 1_178.834,
    1_409.118_849_999_999_8, 1_295.636, 1_487.650_449_999_999_9, 1_452.837,
    1_937.359, 1_260.364, 1_204.708, 1_174.584, 1_206.626,
    4_040.162_000_000_000_3, 1_352.537, 1_296.476, 1_354.092_999_999_999_8,
    1_445.173_049_999_999_9, 1_217.921_900_000_000_3, 1_247.595, 2_094.880_6,
    2_445.73, 1_221.265_55, 1_474.519_55, 1_944.339_949_999_999_8,
    1_291.948_850_000_000_2, 1_239.953, 1_372.515_450_000_000_3,
    1_399.080_000_000_000_2, 1_157.192, 1_359.683, 1_280.294_649_999_999_8,
    1_422.172_500_000_000_1, 1_216.369_25, 1_376.542, 4_039.173, 1_418.733_95,
    2_442.775_45, 4_202.429, 1_336.355_3, 1_468.409_099_999_999_9, 1_194.659,
    1_195.202, 1_406.579_699_999_999_8, 1_216.435, 1_214.807, 4_052.158,
    1_281.377, 1_336.746, 1_231.516, 2_583.844, 1_174.128, 1_230.76,
    2_514.066_75, 1_243.226_55, 1_541.159, 1_773.391, 1_233.010_249_999_999_8,
    1_246.823_05, 1_242.751_150_000_000_3, 1_297.118_650_000_000_1,
    1_401.063_75, 1_369.229_850_000_000_2, 1_301.786_750_000_000_2, 1_424.666,
    1_220.209, 1_182.076, 1_193.782, 1_225.485_2, 1_187.956_999_999_999_9,
    1_283.895_6, 1_493.769_049_999_999_9, 1_374.196, 1_320.522, 1_406.659,
    1_486.421, 1_332.614_7, 1_197.175, 1_237.324_250_000_000_1,
    1_243.939_649_999_999_8, 1_246.583_349_999_999_9, 3_059.037, 1_193.327,
    1_513.674, 1_332.831_000_000_000_1, 1_225.410_400_000_000_2, 1_242.952_6,
    1_190.773_000_000_000_1, 1_482.771_7, 1_226.557, 1_229.143_999_999_999_8,
    1_223.484, 2_508.186_85, 1_669.067, 1_299.839, 1_170, 4_886.937,
    1_616.915_15, 1_246.379_25, 1_713.762, 1_147.591, 1_384.992_900_000_000_2,
    1_198.887, 1_437.099_900_000_000_2, 1_408.297, 1_237.908,
    1_371.542_150_000_000_2, 1_221.826, 1_234.337, 1_693.143_25, 1_165.471,
    1_211.266, 1_401.809_200_000_000_1, 1_268.441_6, 1_734.860_999_999_999_9,
    1_247.645_2, 1_734.713, 1_188.464, 1_217.175_299_999_999_9,
    1_226.205_200_000_000_3, 1_228.146_749_999_999_9, 1_419.293_000_000_000_1,
    1_255.503_55, 1_690.324, 1_218.538_799_999_999_8, 1_176.29, 1_628.475,
    1_209.618_550_000_000_1, 1_287.898_65, 1_330.359_2, 1_489.001_049_999_999_9,
    1_731.112, 1_255.040_249_999_999_8, 1_300.467_299_999_999_8,
    1_206.985_999_999_999_9, 1_202.976_999_999_999_9, 1_894.668_000_000_000_1,
    1_308.332_2, 2_134.923_700_000_000_3, 1_194.829_000_000_000_2,
    1_489.633_600_000_000_1, 1_260.487, 1_665.912, 1_176.393, 1_346.729_05,
    1_194.276, 1_756.337_999_999_999_7, 1_679.255, 1_288.064_5,
    1_341.634_750_000_000_2, 2_481.716_9, 1_200.414, 1_250.890_449_999_999_9,
    1_256.041_55, 1_267.333_6, 1_208.885, 1_188.630_999_999_999_9, 1_226.588,
    1_181.702, 1_491.556, 1_335.186, 1_208.383, 1_344.854, 1_509.483_55,
    1_288.230_249_999_999_8, 2_034.141_549_999_999_8, 1_476.312_450_000_000_4,
    1_165.989, 1_212.749, 4_113.461_999_999_999_5, 1_233.983_1, 1_195.25,
    1_198.110_999_999_999_9, 1_162.144, 4_065.122_999_999_999_6, 1_209.572_05,
    1_294.998_999_999_999_8, 1_228.217, 1_192.038, 1_724.338_900_000_000_2,
    1_150.383, 1_266.453, 1_327.697_999_999_999_9, 1_257.537_7,
    4_034.033_999_999_999_7, 1_202.856, 1_430.539, 1_269.962_65,
    1_181.668_000_000_000_1, 5_067.346_900_000_000_5, 1_206.129_8,
    1_785.813_099_999_999_8, 1_554.533, 1_277.477_350_000_000_1,
    1_434.632_800_000_000_3, 1_795.613_000_000_000_3, 1_880.072_999_999_999_9,
    1_589.379, 1_253.112_35, 1_650.710_100_000_000_2, 1_228.217_999_999_999_8,
    1_279.437_6, 1_195.816, 4_132.769_250_000_001, 1_328.401_8, 1_192.839,
    1_205.068, 1_289.157_249_999_999_7, 1_247.872_85, 1_137.360_000_000_000_1,
    1_812.262_949_999_999_8, 1_279.460_75, 1_799.352_850_000_000_2, 1_267.365,
    1_152.721, 1_185.801, 2_604.657_950_000_000_3, 2_221.315, 1_341.145_3,
    1_332.863_450_000_000_3, 1_249.844, 1_342.573_95, 1_253.132_25, 1_786.964_7,
    1_445.984_199_999_999_9, 4_083.052_100_000_001, 2_381.999_75,
    4_073.546_000_000_000_3, 2_434.696_6, 1_188.289, 1_177.008, 1_141.216,
    1_271.883_150_000_000_1, 1_248.641, 1_261.994_35, 1_252.686_000_000_000_1,
    1_157.972, 1_193.307_65, 1_280.797, 1_274.342_5, 1_259.054,
    1_251.292_299_999_999_8, 1_267.753, 1_280.185_200_000_000_1, 1_232.723,
    1_216.386_599_999_999_8,
  ],
}

export const REAL_WORLD_DATA_2_SIMILAR = {
  data1: [
    8_490.293_000_000_001, 8_518.646_999_999_997, 8_560.180_999_999_999,
    8_624.697_000_000_002, 8_685.822_000_000_011, 8_786.133_000_000_01,
    8_818.657_000_000_012, 8_827.559_999_999_996, 8_937.128_999_999_986,
    9_024.461_000_000_007, 9_122.639_000_000_003, 9_156.037_000_000_011,
    9_260.620_000_000_003, 9_575.397_999_999_996, 10_789.819_000_000_023,
    12_178.027_000_000_016,
  ],
  data2: [
    8_447.615_000_000_002, 8_504.422_999_999_988, 8_551.507_999_999_989,
    8_672.033_000_000_01, 8_672.610_999_999_995, 8_751.861_000_000_015,
    8_813.568_000_000_007, 8_854.921, 8_918.064_000_000_011,
    8_929.218_999_999_994, 9_004.067_999_999_99, 9_151.699_999_999_988,
    9_178.569, 9_235.703, 9_378.695_000_000_009, 9_492.404_999_999_995,
  ],
}

export const REAL_WORLD_DATA_3_SIMILAR = {
  data1: [
    258.303, 268.269, 270.022, 271.094, 271.767, 276.065, 276.907, 278.611,
    278.948, 285.879, 286.215, 307.04, 308.893, 319.635, 220.648, 223.675,
  ],
  data2: [
    29.341, 198.564, 271.469, 271.617, 272.278, 275.328, 276.265, 277.982,
    278.954, 282.291, 283.362, 283.981, 285.537, 296.633, 298.389, 302.163,
  ],
}

export const REAL_WORLD_DATA_4_SIMILAR = {
  data1: [
    220.604, 223.656, 258.32, 268.336, 270.048, 271.074, 271.781, 276.075,
    276.931, 278.617, 278.959, 285.97, 286.25, 307.098, 309, 319.647,
  ],
  data2: [
    198.567, 271.447, 271.609, 272.313, 275.343, 276.176, 277.955, 278.964,
    282.302, 283.365, 284.021, 285.545, 296.697, 298.422, 302.151, 3_434.452,
  ],
}

export const REAL_WORLD_DATA_5_BIMODAL = {
  data1: [
    519.801, 533.615, 551.024, 555.736, 563.744, 581.388, 587.853, 596.867,
    614.921, 1_061.516, 1_067.188, 1_070.919, 1_093.33, 1_108.861, 1_109.863,
    1_159.773,
  ],
  data2: [
    563.563, 567.498, 578.969, 579.425, 581.83, 601.984, 633.422, 1_070.095,
    1_083.78, 1_087.077, 1_090.509, 1_100.632, 1_108.773, 1_113.105, 1_152.18,
    1_169.366,
  ],
}

export const REAL_WORLD_DATA_6_GREATER = {
  data1: [
    1_306.443, 1_310.903, 1_340.962, 1_389.908, 1_392.852, 1_404.943, 1_481.633,
    1_515.726, 1_531.713, 2_025.26, 2_129.93, 2_140.352, 2_149.494, 2_154.601,
    2_208.241, 2_270.812,
  ],
  data2: [
    1_282.607, 1_401.62, 1_437.79, 1_694.19, 1_769.783, 1_889.373, 1_966.746,
    2_059.694, 2_150.603, 2_175.936, 2_185.475, 2_224.197, 2_324.154, 2_352.64,
    2_408.004, 2_502.639,
  ],
}

export const REAL_WORLD_DATA_7_BIMODAL = {
  data1: [
    10.239, 10.293, 10.4, 10.856, 11.11, 11.706, 11.935, 13.279, 66.587, 68.986,
    127.194, 578.245, 586.523, 593.91, 608.943, 706.821,
  ],
  data2: [
    24.992, 28.01, 29.373, 32.647, 93.469, 95.761, 98.026, 99.019, 102.28,
    566.367, 607.782, 609.666, 610.453, 612.29, 621.299, 625.553,
  ],
}

export const REAL_WORLD_DATA_8_SIMILAR = {
  data1: [
    417.276_327_728_271_5, 422.919_284_423_828_1, 436.059_327_728_271_46,
    436.758_325_515_747_06, 453.830_327_728_271_47, 476.993_425_515_747_05,
    477.946_327_728_271_46, 492.485_327_728_271_5, 492.648_027_728_271_53,
    513.358_027_728_271_4, 519.942_027_728_271_6, 523.387_527_728_271_6,
    555.079_306_823_730_5, 587.570_845_550_537_1, 795.722_327_728_271_5,
    803.672_325_515_747_2,
  ],
  data2: [
    407.801_325_515_747_07, 412.041_327_728_271_5, 424.190_325_515_747_1,
    433.719_327_728_271_5, 437.612_327_728_271_5, 485.806_227_728_271_5,
    496.875_684_423_828_03, 497.622_627_728_271_5, 500.867_184_423_828_1,
    502.011_327_728_271_45, 507.216_025_515_747_1, 519.028_727_728_271_5,
    570.675_845_550_537_1, 604.009_723_898_315_3, 939.105_845_550_537_2,
    1_330.734_596_191_406_1,
  ],
}

export const REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY = {
  data1: [
    507.900_000_000_023_3, 564.5, 566.900_000_000_139_7, 576.299_999_999_988_4,
    591.700_000_000_069_8, 596.200_000_000_186_3, 624.900_000_000_139_7,
    625.599_999_999_976_7, 631.300_000_000_046_6, 665.5, 697.800_000_000_046_6,
    892.799_999_999_988_4, 1_904.099_999_999_976_7, 1_944.199_999_999_953_4,
    1_966.799_999_999_988_4, 2_314.199_999_999_953_4,
  ],
  data2: [
    544.700_000_000_186_3, 557.5, 567.099_999_999_976_7, 575.300_000_000_046_6,
    592.899_999_999_906_9, 609.700_000_000_011_6, 621.5, 648.200_000_000_069_8,
    686.099_999_999_976_7, 779.100_000_000_093_1, 784.900_000_000_023_3, 1_314,
    1_854.800_000_000_046_6, 1_911.900_000_000_023_3, 1_930.699_999_999_953_4,
    1_995.400_000_000_023_3,
  ],
}

export const REAL_WORLD_DATA_10_SIMILAR_NOISY = {
  data1: [
    558.377_999_999_996_9, 561.081_999_999_994_5, 568.303_999_999_992_2,
    569.988_999_999_993_8, 571.427_999_999_993_1, 578.806_999_999_993_4,
    587.952_999_999_994_6, 605.625_999_999_993_3, 609.380_999_999_994_2,
    613.041_999_999_991_7, 613.236_999_999_994_3, 615.233_999_999_996,
    621.348_999_999_992_9, 698.209_999_999_991_5, 1_482.734_999_999_994_2,
    1_759.859_999_999_998_8,
  ],
  data2: [
    557.295_999_999_993_6, 559.626_999_999_994_6, 568.406_999_999_992_9,
    571.665_999_999_992_6, 573.823_999_999_994_5, 576.226_999_999_993_3,
    577.368_999_999_993_3, 583.535_999_999_994_5, 585.459_999_999_991_9,
    586.141_999_999_994_1, 605.963_999_999_992_7, 629.867_999_999_994_4,
    632.343_999_999_992_2, 1_458.182_999_999_998_9, 1_524.445_000_000_000_2,
    1_692.597_999_999_992_5,
  ],
}

export const REAL_WORLD_DATA_11_GREATER = {
  data1: [
    11.133, 83.896, 85.574, 86.306, 87.366, 87.633, 88.748, 92.175, 93.393,
    93.599, 97.188, 97.953, 98.112, 100.575, 100.866, 104.848,
  ],
  data2: [
    28.609, 32.887, 113.622, 114.931, 116.095, 117.909, 119.04, 119.453,
    119.808, 122.235, 123.205, 126.081, 126.282, 126.399, 129.288, 131.16,
  ],
}

export const REAL_WORLD_DATA_12_SIMILAR_3_MODES = {
  data1: [
    1_571.389_478_500_366_3, 1_596.372_216_488_647_2, 1_672.555_412_628_174,
    1_685.870_937_988_281_2, 1_732.411_478_500_366_2, 1_735.914_437_988_281_4,
    1_757.900_137_988_281_4, 1_766.620_532_699_585, 1_791.183_9,
    1_791.996_912_628_173_5, 1_834.817_999_999_999_8, 1_838.881_912_628_174_2,
    1_848.065_826_358_032_4, 1_878.100_265_872_192_3, 1_884.327_199_999_999_7,
    1_934.756_412_628_173_8, 2_411.590_912_628_174, 2_544.879_712_628_174,
    2_560.276, 2_575.227_104_858_398_4, 2_581.057_412_628_174,
    2_602.809_662_628_174, 2_623.053_862_628_174, 2_731.189_9,
    2_745.503_212_628_174, 2_831.663_762_628_174_5, 2_839.444_620_071_411_5,
    3_221.315_171_432_495, 3_233.083_05, 3_243.414_862_628_174,
    3_273.717_171_432_495, 3_315.321_401_931_763, 3_322.683_1,
    3_378.788_515_872_192, 3_409.925_512_628_173_2, 3_430.068_054_199_218_8,
    3_437.601_512_628_173_6, 3_447.265_551_931_762_3, 3_505.232_112_628_173,
    3_597.299_912_628_174_3,
  ],
  data2: [
    1_655.187_012_628_173_8, 1_697.844_811_050_415, 1_730.084_998_422_241,
    1_799.137_612_628_173_9, 1_801.482_295_333_862_6, 1_807.406_711_050_415_2,
    1_836.977_598_422_241_5, 2_162.184_772_872_925, 2_417.920_962_628_173_6,
    2_460.178_212_628_173_7, 2_519.031_154_220_581_4, 2_553.425_612_628_173_4,
    2_558.089_507_543_945_3, 2_561.313_312_628_173_7, 2_608.711_75,
    2_612.041_836_044_312, 2_656.109_099_999_999_7, 2_662.936,
    2_665.081_912_628_174, 2_676.876_250_000_000_3, 2_687.371_720_092_774,
    2_692.230_565_872_192_5, 2_714.598_765_426_636, 2_731.218_799_999_999_6,
    2_742.831_912_628_174, 2_788.566_878_500_366_3, 2_849.227_399_999_999_8,
    2_894.401_515_872_192_2, 3_228.729_967_803_955_3, 3_293.002_262_628_174,
    3_299.105_721_432_495, 3_309.343_421_432_495_2, 3_353.753_401_931_762_7,
    3_431.573_551_931_763, 3_444.166_000_000_000_6, 3_453.794_862_628_174,
    3_459.372_478_500_366, 3_468.038_207_962_036, 3_513.263_850_000_000_3,
    3_647.251_095_333_862,
  ],
}
