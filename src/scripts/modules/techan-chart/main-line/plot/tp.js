import { initialiseCustomLineSVG, initialiseCustomLine, createDomain } from '../../../utils'
const showTP = () => config.tp;

function createTp(svg) {
    if (!showTP()) return false;
    return initialiseCustomLineSVG({ svg: svg, name: 'tp-line', clip: 'mClip_' })
}


//create an object with the functions required to render the lines.
const initialiseTP = (opts) => {
    const { x, y } = opts;
    return initialiseCustomLine({ date: 'date', value: 'tp', x: x, y: y });
}

const exe = (svg) => {
    if (!showTP()) return false;
    const { data, init } = svg.datum();
    svg.select('g.tp-line path').datum(data).attr("d", init)
};

const domain = (svg, bool) => {
    if (!showTP()) return false;
    let { data, y, init } = svg.datum();
    if (svg.datum().yDomain == null) {
        svg.datum({ data: data, y: y, init: init, yDomain: y.domain() })
    }

    const tpDomain = [d3.min(data, (d) => (d.tp != 0) ? d.tp : null), d3.max(data, (d) => d.tp)]
    let domain = (bool) ? [...tpDomain, ...y.domain()] : [...svg.datum().yDomain]
    if (tpDomain[0] == null || tpDomain[1] == null) domain = [...svg.datum().yDomain]
    y.domain(createDomain(domain)).nice();
}

const refresh = (selector, line_fnc) => {
    if (!showTP()) return false;
    selector.attr("d", line_fnc)
}

export default {
    createTp,
    showTP,
    initialiseTP,
    domain,
    exe,
    refresh
}