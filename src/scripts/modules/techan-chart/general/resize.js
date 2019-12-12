import {
    set_dim,
    x,
    xU,
    y,
    yPercent,
    y_Eps,
    yAxis,
    xAxis,
    xAxis2,
    percentAxis,
    line_type,
    ma_Line,
    closeAnnotation,
    initalise_indicators,
    timeAnnotation,
    line_type_Crosshair,
    line_type_annotation,
    x2
} from '../set_chart_variables'
import mline from '../main-line'
import c_svg from '../set_chart_svg'
import tp from '../tp'
import eps from '../eps'
import indicators from '../indicators'
import _brush from './brush'
import hovers from './hover'

function resizeChart() {
    let dim = set_dim();

    let param = { dim: dim }

    resizeVars(param);
    resizeSVG(param);
    redraw(param);
}

function resizeVars(opts) {
    const { dim } = opts;
    const xRange = [0, dim.plot.width]
    const yRange = [dim.size.main.height, 0]



    x.range(xRange);
    x2.range(x.range());
    xU.range(x.range());
    y.range(yRange);
    y_Eps.range(y.range());
    yPercent.range(y.range());


    //update the annotation and wire for the main chart
    timeAnnotation.translate([0, dim.position.axisheight])
    line_type_Crosshair.verticalWireRange([0, dim.position.axisheight])
    line_type_annotation.translate([xU(1), 0])

}

function resizeSVG(opts) {
    const { dim } = opts;
    let {
        svg_dim,
        main_axis_g,
        brush_axis_g,
        main_clip_rect
    } = c_svg


    svg_dim = svg_dim.attr("width", dim.width).attr("height", dim.newHeight)
    $('.vbtnbar').height(dim.newHeight);

    //**** main chart */
    main_clip_rect = main_clip_rect.attr("width", dim.plot.width).attr("height", dim.size.main.height)
    c_svg.chart_borders.main.select('rect.main-border-rect-g').attr("height", dim.border.main.height).attr("width", dim.width)
    main_axis_g.xAxis = main_axis_g.xAxis.attr("transform", "translate(0," + dim.position.axisheight + ")")
    main_axis_g.yAxis = main_axis_g.yAxis.attr("transform", "translate(" + xU(1) + ",0)");

    c_svg.handles.main.select('rect').attr("width", dim.width)


    c_svg.brushPane.attr("transform", "translate(" + 0 + "," + (dim.position.spacing.brush) + ")");
    c_svg.indicator_selector_g.select("g.axis.right").attr("transform", "translate(" + xU(1) + ",0)");


    //***** indicators */

    //axis
    brush_axis_g = brush_axis_g.attr("transform", "translate(0," + dim.position.brushAxisHeight + ")")

    c_svg.indicator_clip_f.remove()
    c_svg.indicator_clip_f = indicators.svg.setIndicatorsClip({ svg: c_svg.indicator_clip_g, dim: dim })

    //clipping
    c_svg.indicator_clip_f.select('rect')
        .attr("y", (d) => dim.position.spacing[d])
        .attr("height", (d) => dim.size.indicator[d].height)
    //border:

    c_svg.chart_borders.indicators.selectAll('rect')
        .attr('y', (d) => dim.position.spacing[d] + dim.size.main.padding)
        .attr("height", (d) => dim.border.indicator.height(d))
        .attr("width", dim.width)


    c_svg.handles.indicators.selectAll('g.drag-handle.H rect')
        .attr("y", (d) => dim.border.indicator.handlePos(d))
        .attr("width", dim.width)

    c_svg.handles.indicators.selectAll('g.drag-handle.V rect')
        .attr("y", (d) => dim.border.indicator.handlePosTop(d))
        .attr("height", (d) => dim.border.indicator.height(d))


    c_svg.handles.indicators.selectAll('g.drag-handle.V.right')
        .attr("transform", "translate(" + (dim.width - dim.border.dragHandleSize) + ",0)");
    //*********** */

    d3.selectAll('g.indicator_label').remove();
    d3.selectAll('g.indicator-group').call(hovers.label.createIndicatorHover)
    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: c_svg.main_line_holder_g.datum(), svg: { ma_indicator_g: c_svg.ma_indicator_g } })

}


function redraw(opts) {
    const { dim } = opts;

    //main chart *******/
    c_svg.main_axis_g.yAxis.call(yAxis)
    c_svg.main_axis_g.percentAxis.call(percentAxis)
    c_svg.main_line_g.call(line_type().refresh);
    c_svg.main_chart_crosshair_g.call(line_type_Crosshair.refresh)
    c_svg.closest_price_annotation_g.call(closeAnnotation.translate([xU(1), 0]).refresh)

    if (config.ma.selected != 'none' && config.ma.selected != '') c_svg.ma_indicator_g.call(ma_Line().refresh);

    eps.fnc.refresh(c_svg.eps_lines_g, eps.fnc.initialiseEPS({ x: x, y: y_Eps }))

    c_svg.tp_g.select('g.tp-line path').call(tp.fnc.refresh, tp.fnc.initialiseTP({ x: x, y: y }))

    c_svg.events_g.select('g.historical_g').call(mline.indicators.companyevents.pos, { x: x, y: y })
    c_svg.events_g.select('g.dividends_g').call(mline.indicators.companyevents.pos, { x: x, y: y })
    c_svg.events_g.select('g.flash_g').call(mline.indicators.companyevents.pos, { x: x, y: y })


    c_svg.monitors_g.call(mline.indicators.monitors.pos)
    mline.func.renderAxis(c_svg.main_axis_g.xAxis, xAxis)



    c_svg.bollinger_g.call(mline.plots.overlay.refresh, x, y, 'bollinger')
    c_svg.atrtrailingstop_g.call(mline.plots.overlay.refresh, x, y, 'atrtrailingstop')


    c_svg.supstance_g.call(mline.indicators.supstance.refresh)
    c_svg.tradeArrow_g.call(mline.indicators.tradeArrows.exe)

    c_svg.notes_g.call(mline.indicators.notes.createNodes).call(mline.indicators.notes.pos)
    c_svg.trendlines_g.call(mline.plots.trendline.createTrendLine, { action: 'load', data: {} }).call(mline.plots.trendline.exe)


    mline.func.renderGrid(c_svg.grid_lines_g, mline.func.initialiseGrid(dim, x, y)) //grid

    //*************** */

    //************* indicators */
    config.indicator.selected.forEach((indicatorName) => indicators.main.refresh({
        dim: dim,
        indicator: indicatorName,
        inicator_init: initalise_indicators(dim),
        x: x
    }))

    _brush.refresh({ dim: dim, x2: x2 })
    d3.select(`g.pane`).call(_brush.initialiseBrush(dim, x2).brush)
    _brush.resizeBrushPane({ dim: dim, x2: x2 });

    mline.func.renderAxis(c_svg.brush_axis_g, xAxis2)
    //*************** */
}



export default { resizeChart, redraw }