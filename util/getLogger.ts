import log, { Logger } from 'loglevel';
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

const getLogger = (name: string): Logger => {
  const logger = log.getLogger(name);
  // TODO: Dynamic levels
  // logger.enableAll();

  logger.setLevel('info');
  return logger;
};

export default getLogger;
