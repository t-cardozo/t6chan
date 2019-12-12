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
import c_fnc from '../chart_functions'
import tp from '../tp'
import eps from '../eps'
import indicators from '../indicators'
import _brush from './brush'
import resizeH from './resizeHandler'
import swapV from './swapHandler'
import ma from '../ma'
import hovers from './hover'


function redrawChart() {
    let dim = set_dim();

    const brush_data = d3.select(`g.brush .indicator-plot`).datum();
    const main_data = d3.select(`g.main_line_holder_g`).datum();

    let param = { dim: dim, data: { brush_data, main_data } }

    redrawVars(param);
    redrawSVG(param);
    render(param);
}

function redrawVars(opts) {
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

function redrawSVG(opts) {
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

    //***** indicators */

    //axis
    brush_axis_g = brush_axis_g.attr("transform", "translate(0," + dim.position.brushAxisHeight + ")")

    c_svg.indicator_clip_f.remove()
    c_svg.indicator_clip_f = indicators.svg.setIndicatorsClip({ svg: c_svg.indicator_clip_g, dim: dim })

    //border:
    c_svg.indicator_selector_g.remove();
    c_svg.indicator_selector_g = indicators.svg.setIndicators({ svg: c_svg.indicators_group_g, list: dim.position.modifiedList, x: xU })


    c_svg.indicators_crosshairs_g.selectAll('*').remove();
    indicators.svg.setIndicatorsCrosshairs(c_svg.indicators_crosshairs_g, config.indicator.selected)


    c_svg.chart_borders.indicators.selectAll('*').remove();
    indicators.svg.setIndicatorsBorder({ svg: c_svg.chart_borders.indicators, dim: dim, list: dim.position.modifiedList }) //indicators borders


    c_svg.handles.main.selectAll('*').remove();
    mline.svg.resizeHandle({ svg: c_svg.handles.main, dim: dim, fnc: resizeH.resizeHandleEvent }) //drag handles to resize chart

    c_svg.handles.indicators.selectAll('*').remove();
    indicators.svg.resizeHandle({ svg: c_svg.handles.indicators, dim: dim, set_dim: set_dim, fncs: { h: resizeH.resizeHandleEvent, v: swapV.swapHandleEvent }, x: x, list: dim.position.modifiedList })

    c_svg.brushPane = _brush.setPane(dim)



    //*********** */
}


function render(opts) {
    const { dim, data } = opts;

    //main chart *******/
    c_svg.main_axis_g.yAxis.call(yAxis)
    c_svg.main_axis_g.percentAxis.call(percentAxis)


    mline.func.set_LineData(c_svg.main_line_holder_g, c_svg.main_line_holder_g.datum(), config.line.selected)
    mline.func.set_LineType(c_svg.main_line_g, line_type())


    c_svg.main_chart_crosshair_g.call(line_type_Crosshair.refresh)
    c_svg.closest_price_annotation_g.call(closeAnnotation.translate([xU(1), 0]).refresh)

    //ma

    d3.select('g.ma_g').selectAll('*').remove();
    if (config.ma.selected != 'none' && config.ma.selected != '') {
        c_svg.ma_indicator_g = ma.svg.set_indicator_g(c_svg.ma_g)
        c_svg.ma_g.call(ma._function.set_ma_data, c_svg.ma_indicator_g)
        ma._function.execute_ma(c_svg.ma_indicator_g, ma_Line());
    }
    //eps
    c_svg.eps_g.selectAll('*').remove();
    c_svg.eps_lines_g = eps.svg.setEPS(c_svg.eps_g)
    c_svg.eps_g.call(eps.fnc.exe, c_svg.eps_lines_g)

    //tp
    c_svg.tp_g.selectAll('*').remove();
    c_svg.tp_line_g = mline.plots.tp.createTp(c_svg.tp_g)
    c_svg.tp_g.call(mline.plots.tp.domain, true).call(mline.plots.tp.exe)

    //events
    c_svg.events_g.select('g.historical_g').selectAll('*').remove();
    c_svg.events_g.select('g.historical_g')
        .call(mline.indicators.companyevents.createNodes)
        .call(mline.indicators.companyevents.pos, { x: x, y: y })

    c_svg.events_g.select('g.dividends_g').selectAll('*').remove();
    c_svg.events_g.select('g.dividends_g')
        .call(mline.indicators.companyevents.createNodes)
        .call(mline.indicators.companyevents.pos, { x: x, y: y })

    c_svg.events_g.select('g.flash_g').selectAll('*').remove();
    c_svg.events_g.select('g.flash_g')
        .call(mline.indicators.companyevents.createNodes)
        .call(mline.indicators.companyevents.pos, { x: x, y: y })

    //monitors
    c_svg.monitors_g.call(mline.indicators.monitors.createNodes).call(mline.indicators.monitors.pos)


    c_svg.bollinger_g.selectAll('*').remove();
    c_svg.atrtrailingstop_g.selectAll('*').remove();
    mline.plots.overlay.createOverlay(c_svg.bollinger_g, 'bollinger')
    mline.plots.overlay.createOverlay(c_svg.atrtrailingstop_g, 'atrtrailingstop')
    c_svg.bollinger_g.datum({ data: data.brush_data, x: x, y: y, overlay: 'bollinger' }).call(mline.plots.overlay.exe)
    c_svg.atrtrailingstop_g.datum({ data: data.brush_data, x: x, y: y, overlay: 'atrtrailingstop' }).call(mline.plots.overlay.exe)



    c_svg.supstance_g.selectAll('*').remove();
    mline.indicators.supstance.createSupstance(c_svg.supstance_g)
    c_svg.supstance_g.call(mline.indicators.supstance.exe)

    c_svg.tradeArrow_g.selectAll('*').remove();
    mline.indicators.tradeArrows.createTradeArrows(c_svg.tradeArrow_g)
    c_svg.tradeArrow_g.call(mline.indicators.tradeArrows.exe)


    c_svg.notes_g.call(mline.indicators.notes.createNodes).call(mline.indicators.notes.pos)
    c_svg.trendlines_g.call(mline.plots.trendline.createTrendLine, { action: 'load', data: {} }).call(mline.plots.trendline.exe)


    mline.func.renderGrid(c_svg.grid_lines_g, mline.func.initialiseGrid(dim, x, y)) //grid
    mline.func.renderAxis(c_svg.main_axis_g.xAxis, xAxis)


    //*************** */

    //************* indicators */

    config.indicator.selected.forEach((indicatorName) => {
        let iData = (indicatorName == 'volume' || indicatorName == 'yield' || indicatorName == 'pe_fy1' || indicatorName == 'evebitda') ? data.main_data : data.brush_data;
        indicators.main.exeIndicator({ dim: dim, data: iData, indicator: indicatorName, inicator_init: initalise_indicators(dim), x: x })
    });



    c_svg.hovers_g.call(hovers.line.createHovers, c_svg.ma_indicator_g) //this creates the new hover circles.

    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: data.main_data, svg: { ma_indicator_g: c_svg.ma_indicator_g } })

    c_svg.svg.selectAll("g.crosshair").on('mousemove', null).on("mousemove", function(d) {
        hovers.line.lineHover({ data: { main_data: data.main_data, brush_data: data.brush_data }, x: x, yMain: y, y2: y_Eps, crosshair_e: this, svg: c_svg.hovers_g })
        hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: this, data: data.main_data, svg: { ma_indicator_g: c_svg.ma_indicator_g } })
    });


    _brush.domain({ x: x2, data: data.brush_data, accessor: line_type().accessor() })
    _brush.exe({ dim: dim, data: data.brush_data, x: x, x2: x2, fnc: c_fnc.init })
    d3.select(`g.pane`).call(_brush.initialiseBrush(dim, x2).brush)
    _brush.resetBrushSelection({ dim: dim, x2: x2 });

    mline.func.renderAxis(c_svg.brush_axis_g, xAxis2)
    //*************** */
}



export default { redrawChart }