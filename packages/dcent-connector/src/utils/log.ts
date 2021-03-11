let LOG: Function;
if (process.env.NODE_ENV !== 'production') {
  LOG = console.log.bind(console, '[LOG]');
} else {
  LOG = () => {};
}

export default LOG;