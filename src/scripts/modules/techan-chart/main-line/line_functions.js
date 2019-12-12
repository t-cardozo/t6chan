const renderAxis = (selector, axis) => selector.call(axis);


function set_LineType(selector, lineType) {

    selector.select("g.data").remove();
    selector.call(lineType);
}

function set_LineData(selector, data, line_name) {
    let line = (line_name == null) ? config.line.selectedFix() : line_name;
    selector.datum(data)
    //add on to this if more lines are added where data needs to be generated..
    let newdata = (line == 'heikinashi') ? techan.indicator[line]()(data) : data;

    selector.select('g').datum(newdata)
}


function setAxisAnnotation(opts) {

    const {
        axis,
        orient,
        format,
        accessor,
        translate,
        width
    } = opts

    let anno = techan.plot.axisannotation()

    if (axis != null) anno = anno.axis(axis)
    if (orient != null) anno = anno.orient(orient)
    if (format != null) anno = anno.format(format)
    if (accessor != null) anno = anno.accessor(accessor)
    if (translate != null) anno = anno.translate(translate)
    if (width != null) anno = anno.width(width)

    return anno;
}

const initialiseGrid = (dim, x, y) => {
    let grid = {}
    if (config.grid.x) grid.x = d3.axisRight(y).ticks(5).tickSize(dim.plot.width).tickFormat("")
    if (config.grid.y) grid.y = d3.axisBottom(x).ticks(5).tickSize(dim.size.main.height).tickFormat("")

    return grid;
}

const renderGrid = (svg, init) => {

    for (let key in svg) {
        let _svg = svg[key],
            _init = init[key]
        _svg.call(_init)
    }

    svg.x.selectAll('.tick').attr('visibility', $('#btn-fn-grid-x').is(':checked') ? 'visible' : 'hidden');
    svg.y.selectAll('.tick').attr('visibility', $('#btn-fn-grid-y').is(':checked') ? 'visible' : 'hidden');

}


const line_functions = {
    renderAxis,
    set_LineType,
    set_LineData,
    setAxisAnnotation,
    initialiseGrid,
    renderGrid
}




export default line_functions;