import { jsFormatDate } from '../../utils'


function initialiseBrush(dim, x) {

    let brushOBJ = {}

    brushOBJ.brush = d3.brushX()
        .extent([
            [0, 0],
            [dim.plot.width, dim.size.indicator.brush.height]
        ]).on("end", brushed)



    brushOBJ.brushLine = techan.plot.close()
        .xScale(x)
        .yScale(dim.position.iScale.brush);

    brushOBJ.axisLeft = d3.axisLeft(dim.position.iScale.brush).ticks(0);
    brushOBJ.axisRight = d3.axisRight(dim.position.iScale.brush).ticks(0);

    return brushOBJ
}

function brushed(opts) {

	
	
    const { dim, data, x, x2, fnc_init } = opts;

    const zoomable = x.zoomable(),
        zoomable2 = x2.zoomable(),
        s = d3.event.selection





    var sRange = (s != null) ? s.map(zoomable2.invert) : x2.range().map(zoomable2.invert)
    var s0Range = (Math.round(sRange[0]) < 0) ? 0 : Math.round(sRange[0])
    var s1Range = Math.round(sRange[1])

    var sliceData = data.slice.apply(data, [s0Range, s1Range]);
    var brushRange = { s: sliceData[0].date, e: sliceData[sliceData.length - 1].date };

    var x2Dom = x2.domain();

    const brushAtEnd = moment(brushRange.e).format('YYYY-MM-DD') == moment(x2Dom[x2Dom.length - 1]).format('YYYY-MM-DD');
    d3.selectAll("g.close1.annotation.up").attr("visibility", (brushAtEnd) ? "visible" : "hidden");


    if (s == null) {
        resetBrushSelection({ dim: dim, x2: x2 })
        fnc_init('brushed');
    }


    //set the new brush range in config:
    config.data.s = moment(brushRange.s).format('YYYY-MM-DD')
    config.data.e = moment(brushRange.e).format('YYYY-MM-DD')
    

    if (!((d3.event.sourceEvent != null) && (d3.event.sourceEvent.type != 'end'))) return;
    if (!d3.event.selection) return;
    if (d3.event.sourceEvent.type == 'drag') return
    if ($(d3.event.sourceEvent.toElement).attr('id') == 'line_drawing_rect') return;

	$('#chart_refreshing').show();	 
	
    $("#brushDays").val(Math.abs(calcDate(brushRange.s, brushRange.e)));

    fnc_init('brushed', function () {
		$('#chart_refreshing').hide();	 
	});
    //run code here that only works when you have interacted with brush. 
}

function calcDate(date1, date2) {
    var diff = Math.floor(date1.getTime() - date2.getTime());
    var day = 1000 * 60 * 60 * 24;
    var days = Math.floor(diff / day);
    return days;
}



function setx2Axis(svg, height) {
    return svg.append("g")
        .attr("class", "x axis2")
        .attr("transform", "translate(0," + height + ")");
}

function setPane(dim) {
    return d3.select(`g.brush`).append("g")
        .attr("class", "pane")
        .attr("transform", "translate(" + 0 + "," + (dim.position.spacing.brush) + ")");
}

function exe(opts) {


    const { dim, data, x, x2, fnc } = opts
    dim.position.iScale.brush.domain(techan.scale.plot.ohlc(data).domain())

    const init = initialiseBrush(dim, x2);
    //render axis
    d3.select(`g.brush .axis.left`).call(init.axisLeft);
    d3.select(`g.brush .axis.right`).call(init.axisRight);

    //render pane
    d3.select(`g.pane`).datum({ dim: dim, data: data, x: x, x2: x2, fnc_init: fnc }).call(init.brush)
    d3.select(`g.brush .indicator-plot`).datum(data).call(init.brushLine); //render chart
}

function domain(opts) {
    const { x, data, accessor } = opts;
    return x.domain(data.map(accessor.d));
}

function refresh(opts) {
    const { dim, x2 } = opts

    const init = initialiseBrush(dim, x2);

    const data = d3.select(`g.brush .indicator-plot`).datum()
    dim.position.iScale.brush.domain(techan.scale.plot.ohlc(data).domain())
    d3.select(`g.pane`).call(init.brush)
    d3.select(`g.brush .axis.left`).call(init.axisLeft);
    d3.select(`g.brush .axis.right`).call(init.axisRight);
    //render chart
    d3.select(`g.brush .indicator-plot`).call(init.brushLine.refresh);
}

const resetBrushSelection = (o) => {
    const init = initialiseBrush(o.dim, o.x2);

    const brushDays = Number($('#brushDays').val()) || 1500
    const endDate = moment(o.x2.domain()[o.x2.domain().length - 1]).format('YYYY-MM-DD');
    var startDate = moment(endDate).subtract(brushDays, 'days').format('YYYY-MM-DD');
    config.data.s = startDate;
    config.data.e = endDate;
    d3.select("g.pane").call(init.brush.move, [jsFormatDate(startDate), jsFormatDate(endDate)].map(o.x2));
}

const resizeBrushPane = (o) => {
    const init = initialiseBrush(o.dim, o.x2)
    d3.select("g.pane").call(init.brush.move, [jsFormatDate(config.data.s), jsFormatDate(config.data.e)].map(o.x2));
}

export default {
    initialiseBrush,
    setx2Axis,
    exe,
    refresh,
    domain,
    setPane,
    resetBrushSelection,
    resizeBrushPane
}