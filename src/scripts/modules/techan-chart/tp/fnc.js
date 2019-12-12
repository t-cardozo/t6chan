import { initialiseCustomLine, createDomain } from '../../utils'

const showTP = () => config.tp;

//create an object with the functions required to render the lines.
const initialiseTP = (opts) => {
    if (!showTP()) return false;
    const { x, y } = opts;
    if (showTP()) return initialiseCustomLine({ date: 'date', value: 'tp', x: x, y: y });
}

const exe = (opts) => {
    if (!showTP()) return false;
    const { data, svg, init } = opts;
    svg.datum(data).attr("d", init)
};

const domain = (opts) => {
    if (!showTP()) return false;

    const { data, y } = opts
    const tpDomain = [d3.min(data, (d) => d.tp), d3.max(data, (d) => d.tp)]
    const domain = [...tpDomain, ...y.domain()]
    console.log(domain);

    y.domain(createDomain(domain)).nice();


}

const refresh = (selector, line_fnc) => {
    if (!showTP()) return false;
    const { data } = selector.datum();
    selector.datum(data).attr("d", line_fnc)
}

export default {
    showTP,
    initialiseTP,
    domain,
    exe,
    refresh
}