module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/config/swagger.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Désactiver l'exécution parallèle pour éviter les conflits de base de données
  maxWorkers: 1
};

