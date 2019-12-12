import { initialiseCustomLine } from '../../utils'

//create an array based on what is requested
const epsArr = () => {

    const selectedEPS = config.eps.selected();
    let eps = []
    if (selectedEPS.includes('eps')) {
        for (let i = 1; i < 15; i++) eps.push('epsm' + i)
        eps = [...eps, 'eps0', 'eps1', 'eps3']
    }

    if (selectedEPS.includes('epsrolling1')) eps = [...eps, 'epsrolling1']
    if (selectedEPS.includes('epsrolling2')) eps = [...eps, 'epsrolling2']

    return eps;
}



//create an object with the functions required to render the lines.
const initialiseEPS = (opts) => {
    const { x, y } = opts;
    let epsInit = {}
    epsArr().forEach((epsName) => epsInit[epsName] = initialiseCustomLine({ date: 'date', value: epsName, x: x, y: y }));
    return epsInit;
}

const setDomain = (svg) => {
    const { data, y } = svg.datum();
    let epsdomain = []
    data.forEach((d) => {
        epsArr().forEach((epsName) => {
            epsdomain.push(d[epsName])
        });
    });

    const minValue = Math.min.apply(null, epsdomain.filter(Number)) //strips out all 0s to give accurate value.
    const maxValue = Math.max.apply(null, epsdomain.filter(Number))

    y.domain([minValue, maxValue]).nice();
}

const exe = (selector, svg_lines_g) => {

    const { data, x, y } = selector.datum();

    const init = initialiseEPS({ x: x, y: y })
    setDomain(selector)

    for (let i in svg_lines_g) {
        let _svg = svg_lines_g[i],
            _init = init[i]

        _svg.datum(data).attr("d", _init)
    }
};

const refresh = (selector, line_fnc) => {

    for (let i in selector) {
        let _svg = selector[i],
            _init = line_fnc[i]

        _svg.attr("d", _init)
    }
}

export default {
    initialiseEPS,
    epsArr,
    setDomain,
    exe,
    refresh
}