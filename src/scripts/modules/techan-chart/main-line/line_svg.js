const main_line_g = (selector) => {

    return selector.append("g")
        .attr("class", "main-line-chart")
}

const main_axis_g = (selector, type, opts) => {

    const axis = [];

    if (type == 'x' || type == 'all') {
        axis['xAxis'] = selector.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + opts.height + ")");

    }

    if (type == 'y' || type == 'all') {
        axis['yAxis'] = selector.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + opts.x(1) + ",0)");

    }

    if (type == 'p' || type == 'all') {
        axis['percentAxis'] = selector.append("g")
            .attr("class", "percent axis")
    }

    return axis

}

const set_main_border = (opts) => {
    const { svg, width, height } = opts;
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .attr('class', 'main-border-rect-g border-rect-group')
        .style("fill", "none")
        .style("stroke-width", 1)
    // .style('stroke', 'red')
}

const resizeHandle = (opts) => {

    const { svg, dim, fnc } = opts;

    svg.append("rect")
        .data(['ohlc'])
        .attr("x", 0)
        .attr("y", dim.border.main.handlerPos)
        .attr("class", "drag-handle ohlc")
        .attr("height", dim.border.dragHandleSize)
        .attr("width", dim.width)
        .attr("fill", "#AAB5BF")
        .attr("fill-opacity", .3)
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .attr("cursor", "row-resize")
        .style("pointer-events", "all")
        .call(fnc);
}

const setGridSVG = (svg) => {
    const grid = {}
    if (config.grid.x) grid.x = svg.append('g').attr('class', 'xGrid')//.attr('visibility', $('#btn-fn-grid-x').is(':checked') ? 'visible' : 'hidden');
    if (config.grid.y) grid.y = svg.append('g').attr('class', 'yGrid')//.attr('visibility', $('#btn-fn-grid-y').is(':checked') ? 'visible' : 'hidden');

    return grid;
}

const svg = {
    main_line_g,
    main_axis_g,
    set_main_border,
    resizeHandle,
    setGridSVG
}

export default svg