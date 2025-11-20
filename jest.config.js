export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  // 👇 This is the magic bit for NodeNext / ESM + TS
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};