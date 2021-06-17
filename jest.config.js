module.exports = {
	// 10x perf improvement, see:
	// https://github.com/kulshekhar/ts-jest/issues/1044
	// Consider ts-jest isolatedModules for more perf.
	maxWorkers: 1,

	preset: 'ts-jest',
}
