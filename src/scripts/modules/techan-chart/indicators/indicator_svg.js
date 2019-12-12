import { set_dim } from "../set_chart_variables";
import hovers from '../general/hover'

function setIndicatorsClip(opts) {

    const { svg, dim } = opts;

    const indicatorList = dim.position.modifiedList
    const indicators = svg.selectAll("indicatorClip").data(indicatorList)
        .enter()
        .append("clipPath")
        .attr("id", (d, i) => "indicatorClip-" + i)

    const rect = indicators.append("rect")
        .attr("x", 0)
        .attr("y", (d) => dim.position.spacing[d])
        .attr("width", dim.plot.width)
        .attr("height", (d) => dim.size.indicator[d].height)

    return indicators
}

function setIndicatorsBorder(opts) {
    const { svg, dim, list } = opts;

    let indicators = svg.selectAll("svg > g.indicator")
        .data(list).enter()
        .append("g")
        .attr("class", (d) => d + " indicator-border-group");

    indicators.append("rect")
        .attr("y", (d) => dim.position.spacing[d] + dim.size.main.padding)
        .attr("width", dim.width)
        .attr("height", (d) => dim.border.indicator.height(d))
        .style("fill", "none")
        .style("stroke-width", 1)
        //    .style("stroke", "red")
        .attr('class', 'border-rect-group')


    return svg.selectAll('g')
}

function resizeHandle(opts) {
    let { svg, dim, list, fncs } = opts;

    svg.selectAll("svg > g.indicator")
        .data(list).enter()
        .append("g")
        .attr("class", (d) => d + " drag-handle H")
        .append("rect")
        .attr("y", (d) => dim.border.indicator.handlePos(d))
        .attr("width", dim.width)
        .attr("height", dim.border.dragHandleSize)
        .attr("fill", "#AAB5BF")
        .attr("fill-opacity", .3)
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .attr("cursor", "row-resize")
        .style("pointer-events", "all")
        .call(fncs.h);


    const vertHandles = svg.selectAll("svg > g.indicator")
        .data((list.includes('brush')) ? list.slice(0, -1) : list).enter() //sliced because brush does not get a vert handle
        .append("g")
        .attr("class", (d) => d + " drag-handle V")

    vertHandles.append("g")
        .attr("class", (d) => d + " drag-handle V left")
        .append("rect")

    vertHandles.append("g")
        .attr("class", (d) => d + " drag-handle V right")
        .attr("transform", "translate(" + (dim.width - dim.border.dragHandleSize) + ",0)");

    vertHandles.selectAll('g.drag-handle.V').append("rect")
        .attr("y", (d) => dim.border.indicator.handlePosTop(d))
        .attr("x", 0)
        .attr("width", dim.border.dragHandleSize)
        .attr("height", (d) => dim.border.indicator.height(d))
        .attr("fill", "#AAB5BF")
        .attr("fill-opacity", .3)
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .attr("cursor", "move")
        .style("pointer-events", "all")
        .call(fncs.v, (list.includes('brush')) ? list.slice(0, -1) : list, set_dim);

    return svg.selectAll('g')
}

function setIndicators(opts) {

    const { svg, x, list } = opts;

    let indicators = svg.selectAll("svg > g.indicator").data(list).enter()
        .append("g")
        .attr("class", function(d) {
            return d + " indicator-group";
        });

    let indicatorSelection = indicators
        .append("g")
        .attr("class", function(d) {
            return d + " indicator";
        });

    indicatorSelection.append("g")
        .attr("class", "axis right")
        .attr("transform", "translate(" + x(1) + ",0)");

    indicatorSelection.append("g")
        .attr("class", "axis left")
        .attr("transform", "translate(" + x(0) + ",0)");

    indicatorSelection.append("g")
        .attr("class", "indicator-plot")

    svg.select('g.brush.indicator-group').raise(); //raise this to the end, so the clips dont get confused.. 
    updateClips(svg);


    indicatorSelection.call(hovers.label.createIndicatorHover, 'load')


    return svg.selectAll('g.indicator-group')

}

function updateClips(svg) {
    svg.selectAll('g.indicator-plot').attr("clip-path", (d, i) => "url(#indicatorClip-" + i + ")");
}
const setIndicatorsCrosshairs = (selector, list) => {

    let crosshairs = [];
    list.forEach((indicatorName) => {
        let crosshair = selector.append('g').attr("class", "indicator crosshair " + indicatorName)
        crosshairs.push(crosshair)
    });
    return crosshairs;
}



export default {
    setIndicatorsClip,
    setIndicators,
    setIndicatorsCrosshairs,
    setIndicatorsBorder,
    resizeHandle,
    updateClips
}