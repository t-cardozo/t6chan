const check = () => config.line.indicators.supstance

let div = null;

function initialiseSupstance(opts) {
    if (!check()) return false;
    const { x, y } = opts;

    return techan.plot.supstance()
        .xScale(x)
        .yScale(y)
        .on("mouseenter", supHover)
        .on("mouseout", supExit)
}

function supHover(d) {

    div.transition().duration(200).style("opacity", .95);
    const rangeType = (d.type == 'Max') ? 'Resistance' : 'Support'
    div.html(`${rangeType}: Date: ${d.unformatedstart} | Price: $${d.value.toFixed(2)}`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");

}
const supExit = () => div.transition().duration(200).style("opacity", 0);

function createSupstance(svg) {
    if (!check()) return false;

    return svg.append("g")
        .attr("class", "supstances")
        .attr("clip-path", "url(#mClip_)")
}

function exe(svg) {
    if (!check()) return false;

    div = d3.select('div.tooltip'); //getting the hover ready

    const { data, x, y } = svg.datum();
    const supstances_g = svg.select('g.supstances');

    supstances_g.datum(data).call(initialiseSupstance({ x: x, y: y }))
    const supstancePath = supstances_g.selectAll('g.data.scope-supstance g.supstance path');
    supstancePath.each((d, i) => d3.select(supstancePath._groups[0][i]).attr('class', (d.type == 'Max') ? 'resistance-line' : 'support-line'));
}

function refresh(svg) {
    if (!check()) return false;
    const { x, y } = svg.datum();
    const supstances_g = svg.select('g.supstances');
    supstances_g.call(initialiseSupstance({ x: x, y: y }).refresh)
}


export default {
    createSupstance,
    exe,
    refresh
}