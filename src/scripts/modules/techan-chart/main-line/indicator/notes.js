let g = {}
let div = null;



function fixData(notes_data, domain_dates) {

    //  console.log(notes_data, domain_dates);
    const newData = []
    for (var i in notes_data) {
        const date_found = domain_dates.find((d) => moment(d).format("YYYY-MM-DD") == notes_data[i].AsAtDate);
        if (date_found != null) newData.push(notes_data[i])
    }
    return newData
}

function createNodes(svg) {
    const { data, x, y, date_array } = svg.datum();
    g = { data: data, x: x, y: y, date_array: date_array };


    $("#myModal").removeData("lineData");
    $('#myModal').data("lineData", { date_array: g.date_array });

    div = d3.select('div.tooltip'); //getting the hover ready
    svg.selectAll('g.notes_events').remove();

    const newData = fixData(data, x.domain())
    svg.selectAll("svg > g.indicator").data(newData).enter().call(template)
}

function template(svg) {
    svg.append("g")
        .attr('class', (d) => "notes_events " + d.id)
        .style('cursor', 'pointer')
        .append('path')
        .attr('d', custom_svg_icon.file_alt)
        .classed("notes_event", true)
        .on("mouseover", notes_hover)
        .on("mouseout", notes_exit)
        .on("click", notes_click)
}

const pos = (svg) => {
    const { x, y } = g
    const yDomainPercentage = ((y.domain()[1] - y.domain()[0]) / 10) + y.domain()[0]

    svg.selectAll("path.notes_event")
        .attr('transform', function(d) {

            let date = new Date(d.AsAtDate)
            var percent = (x(date) * 0.006)
            return "translate(" + (x(date) - percent) + "," + y(yDomainPercentage) + ")scale(0.03)"
        })

}

function notes_hover(d) {
    d3.select(this).classed("highlight", true)

    div.transition().duration(200).style("opacity", .95);

    div.html(moment(d.AsAtDate).format("DD MMM YYYY") + ': [' + $.trim(d.Subject) + ']')
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");


}

function notes_exit() {
    d3.select(this).classed("highlight", false)
    div.transition().duration(200).style("opacity", 0);
}

function notes_click(d) {


    $('#myModal').modal('show');
    $('.modal-title').text(d.Subject);
    $('.modal-body').load("report/dsp_research_summary_chart_v2_notes.cfm?symbol=" + d.Symbol + '&date=' + moment(d.AsAtDate).format("DD/MMM/YYYY"));
}

export default { createNodes, pos }