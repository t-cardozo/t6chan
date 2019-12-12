const event_c = (d) => config.line.indicators.events[d]
const p = {}
let div = null;
const template = (selector) => {

    if (!event_c(p.type).show) return false;
    const ce = selector.append("circle")
        .attr("class", "hevent")
        .attr("r", event_c(p.type).prop.size)
        .attr('data-type', p.type)
        .style("fill", event_c(p.type).prop.color)
        .style("stroke", "#000000")
        .style("cursor", "pointer")
        .on("mouseover", cEventEnter)
        .on("mouseout", cEventExit)
        .on("click", cEventClick);

}

function cEventClick(d) {
    const type = d3.select(this).attr('data-type');
    if (type == 'flash') {
        storeData(d.event, d.url);
        $('#myModal').modal('show');
        $('.modal-title').text(d.event);
        $('.modal-body').load("report/inc_research_flash.cfm?blogID=" + d.url);
    }

    if (type == 'companynews') {
        var symbol = $('table#mstrTable tbody').find('.symbolRow.info').attr('id');
        storeData(d.event, d.url);
        loadPDFModal(symbol, d);
    }
}

function cEventExit(d) {
    const type = d3.select(this).attr('data-type');
    d3.select(this).attr("r", event_c(type).prop.size);
    div.transition().duration(200).style("opacity", 0);
}

function cEventEnter(d) {
    const type = d3.select(this).attr('data-type');
    d3.select(this).attr("r", Number(event_c(type).prop.size) + 1);
    div.transition().duration(200).style("opacity", .9);

    if (type == 'companynews') div.html(`<i class='fa fa-bullhorn' aria-hidden='true'></i> (${d.cdate}) ${d.event} (${d.source})`)
    if (type == 'dividends') div.html(`(${d.cdate}) Dividend of ${d.currency} ${d.divtotal} ${d.franking} franking payable on (${d.paydate})`)
    if (type == 'flash') div.html(`<i class='fa fa-bullhorn' aria-hidden='true'></i> (${d.cdate}) ${d.event} (${d.source})`)

    div.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");
}

const createNodes = (selector) => {

    const data = selector.datum();
    p.type = data.type
    if (!event_c(data.type).show) return false;

    div = d3.select('div.tooltip'); //getting the hover ready
    selector.selectAll('circle').remove();
    selector.selectAll("svg > g.indicator").data(data.d).enter().call(template)
}

const pos = (selector, axis) => {
    if (!event_c(p.type).show) return false;
    const { x, y } = axis;
    selector.selectAll('circle')
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.low) })
}

export default {
    createNodes,
    pos
};