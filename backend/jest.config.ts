
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    testMatch: ['**/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    forceExit: true,
    clearMocks: true,
    
    verbose: true,
    
    runInBand: true,
    
    bail: false,
    
    testTimeout: 10000,
    
    reporters: [
      "default",
      ["./node_modules/jest-html-reporters", {
        "publicPath": "./coverage/html-report",
        "filename": "report.html",
      }]
    ]
};