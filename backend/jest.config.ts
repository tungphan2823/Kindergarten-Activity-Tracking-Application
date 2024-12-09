// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    testMatch: ['**/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    forceExit: true,
    clearMocks: true,
    // Add these options for better test output
    verbose: true,
    // Run tests in band (serially)
    runInBand: true,
    // Show test results in real time
    bail: false,
    // Add timing information
    testTimeout: 10000,
    // Add custom reporters for better output
    reporters: [
      "default",
      ["./node_modules/jest-html-reporters", {
        "publicPath": "./coverage/html-report",
        "filename": "report.html",
      }]
    ]
};