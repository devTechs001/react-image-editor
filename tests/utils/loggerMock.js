// tests/utils/loggerMock.js
const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  stream: {
    write: jest.fn()
  }
};

module.exports = loggerMock;
