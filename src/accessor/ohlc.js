export default () => {
  let date = d => d.date,
    open = d => d.open,
    high = d => d.high,
    low = d => d.low,
    close = d => d.close,
    volume = d => d.volume;

  const accessor = d => accessor.c(d);

  accessor.date = (..._) => {
    if (!_.length) return date;
    date = _[0];
    return bind();
  };

  accessor.open = (..._) => {
    if (!_.length) return open;
    open = _[0];
    return bind();
  };

  accessor.high = (..._) => {
    if (!_.length) return high;
    high = _[0];
    return bind();
  };

  accessor.low = (..._) => {
    if (!_.length) return low;
    low = _[0];
    return bind();
  };

  accessor.close = (..._) => {
    if (!_.length) return close;
    close = _[0];
    return bind();
  };

  accessor.volume = (..._) => {
    if (!_.length) return volume;
    volume = _[0];
    return bind();
  };

  const bind = () => {
    accessor.d = date;
    accessor.o = open;
    accessor.h = high;
    accessor.l = low;
    accessor.c = close;
    accessor.v = volume;

    return accessor;
  };

  return bind();
};
