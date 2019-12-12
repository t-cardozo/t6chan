export default () => {
  let date = d => d.date,
    open = d => d.open,
    high = d => d.high,
    low = d => d.low,
    close = d => d.close,
    volume = d => d.volume;

  const accessor = d => accessor.c(d);

  accessor.date = _ => {
    if (!arguments.length) return date;
    date = _;
    return bind();
  };

  accessor.open = _ => {
    if (!arguments.length) return open;
    open = _;
    return bind();
  };

  accessor.high = _ => {
    if (!arguments.length) return high;
    high = _;
    return bind();
  };

  accessor.low = _ => {
    if (!arguments.length) return low;
    low = _;
    return bind();
  };

  accessor.close = _ => {
    if (!arguments.length) return close;
    close = _;
    return bind();
  };

  accessor.volume = _ => {
    if (!arguments.length) return volume;
    volume = _;
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
