import log, { Logger, LogLevelDesc } from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

prefix.reg(log);
prefix.apply(log, {
  template: '[%t] %l (%n):',
  levelFormatter(level) {
    return level.toUpperCase();
  },
  nameFormatter(name) {
    return name ?? 'Global';
  },
  timestampFormatter: function (date) {
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
  },
});

const getLogger = (name: string, logLevel?: LogLevelDesc): Logger => {
  const logger = log.getLogger(name);
  logger.setLevel(logLevel ?? 'info');
  return logger;
};

export default getLogger;
