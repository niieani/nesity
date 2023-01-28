# nesity-statistics

This package provides a set of functions for statistical analysis.

It focuses on comparing datasets acquired from benchmarks.

## Installation

```bash
yarn install nesity-statistics
```

## Functionality

### Comparing two datasets

The `compare` function can be used to assess whether two datasets differ from each other, and if so, what's the effect size.
It uses the t-test to assess whether the two datasets differ from each other, and Cohen's d to assess the effect size.

Special features:

- The function has built-in denoising mechanisms that can improve the accuracy of results if the sample size is small.
- It will also work in case the datasets have multiple modalities, by matching the modalities and performing separate comparisons on them, then combining the results into a single result, weighted by the number of samples present.

For best results ensure that:

- Each modality is either normally distributed, or uniform.
- The datasets have a similar number of samples.

```typescript
import { compare } from 'nesity-statistics'

const result = compare({
  data1: [
    /*...*/
  ],
  data2: [
    /*...*/
  ],
  confidenceLevel: 0.95, // use alpha = 0.05 for the t-test
  minimalModalitySize: 4, // reject all modalities with less than 4 samples
  denoisingAndModalitySplittingOptions: {
    // see section on splitting modalities for the differences between 'quantile' and 'kde' splitting
    type: 'quantiles',
  },
})
```

### Splitting a dataset's modalities

Two functions are provided to split a dataset's modalities:

- `splitMultimodalDistributionWithQuantiles` - a very fast function that uses large jump in upper quantiles to find the splits in the dataset's modalities.
- `splitMultimodalDistributionWithKDE` - a computationally intensive function that uses Kernel Density Estimation to find the splits in the dataset's modalities.

The quality of the results is similar in most cases, but the `splitMultimodalDistributionWithQuantiles` function is much faster.
In certain cases using KDE will result in better results, but it's not recommended to use it unless you have a good reason to do so.

### Matching modalities

Function `matchModalities` can be used to match the modalities of two datasets by their means.

For example, given the following datasets:

```typescript
const data1 = [
  [1, 2, 3],
  [4, 5, 6],
]
const data2 = [
  [2, 3, 4],
  [5, 6, 7],
  [8, 9, 10],
]
const expectedResult = [
  // modality 1:
  [
    // data from 1
    [1, 2, 3],
    // data from 2
    [2, 3, 4],
  ],
  // modality 2:
  [
    [4, 5, 6],
    [5, 6, 7],
  ],
  // modality 3:
  [undefined, [8, 9, 10]],
]
```

The function will prioritize modalities with similar number of samples, and will try to match them by their means.
You may adjust how the modalities are prioritized using the following parameters:

- `meanDistanceWeight` - the weight of the mean distance in the comparison
- `sizeRatioWeight` - the weight of the sample size ratio in the comparison
- `prioritizeSizeRatioAbove` - prioritize modalities with a sample size ratio above this value

### Optimize

The optimize function is a generic utility function to find the "best" input parameter/output result combination.
It works by computing results, and then comparing them with each other result.
It can be used to optimize an objective function by repeatedly evaluating it with different input parameters,
and comparing the results of these evaluations to determine the best result and input parameter combination.
The optimization is performed in a series of iterations, with each iteration producing a set of results.
Each iteration result is compared with each other iteration result, and the results are sorted by their comparison rank.

It returns an array of optimization results sorted by their comparison rank.
Each result is an array with the iteration argument, the iteration result, the comparison metadata, the comparison rank and a done flag.

One example usage of the optimize function could be to find the parameters to pass to a noise reduction function, which result in the best noise reduction in a 2-sample dataset.

Let's say we want to find the parameters that result in the lowest standard deviation:

```typescript
import { optimize } from 'nesity-statistics'

const data = [
  [
    /* set 1: ... */
  ],
  [
    /* set 2: ... */
  ],
]
const iterate = (parameters): number[] => {
  return reduceNoise(data, parameters)
}

const getNextIterationArgument = (iteration: number) => {
  return {
    x: iteration * 0.1,
  }
}

const compare = (
  [a1, a2]: number[],
  [b1, b2]: number[],
): [number, { diff: number }] | INVALID_LEFT | INVALID_RIGHT => {
  // we should have at least 2 values for the result to be considered valid:
  if (a1.length < 2 || a2.length < 2) {
    return INVALID_LEFT
  }
  if (b1.length < 2 || b2.length < 2) {
    return INVALID_RIGHT
  }
  const diffA = stdev(a1) - stdev(a2)
  const diffB = stdev(b1) - stdev(b2)
  const comparisonDiff = Math.abs(diffA) - Math.abs(diffB)
  // the 2nd argument of the return value is the comparison metadata
  // if the comparison is expensive,
  // it could be used to keep a reference to any data about the "winning" result,
  // used to perform the comparison
  return [comparisonDiff, comparisonDiff <= 0 ? diffA : diffB]
}

const sortedResults = optimize({
  iterate,
  iterations: 100,
  getNextIterationArgument,
  compare,
})

const bestResult = sortedResults[0]
const [bestParameters, bestResult, bestMeta] = bestResult
```
