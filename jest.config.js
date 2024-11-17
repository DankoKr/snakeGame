/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.(css|less|scss|sass|svg|png|jpg|jpeg|gif|ttf|eot)$':
      'jest-transform-stub',
  },
};
