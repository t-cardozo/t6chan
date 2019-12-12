import { x, set_dim } from './set_chart_variables.js';
import mline from './main-line'
import ma from './ma'
import eps from './eps'
import indicator from './indicators'
import resizeH from './general/resizeHandler'
import swapV from './general/swapHandler'
import _brush from './general/brush'
import hovers from './general/hover'
const chart_svg = (function() {

    //create a hover over div that displays information 
    let hoverDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);



    let dim = set_dim();
    let svg_dim = '';

    svg_dim = d3.select((window.location.hostname == 'localhost') ? "body" : "#chartcanvas")
        .append("div")
        .attr("id", "divChart")
        .append("svg")
        .attr("id", "summary_chart")
        .attr("width", dim.width)
        .attr("height", dim.height)

    let svg = svg_dim.append("g")
        .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")"),

        //**** SET CLIPPING */
        def_g = svg.append("defs"),



        clipper_g = def_g.append("clipPath")
        .attr("id", "mClip_"),

        main_clip_rect = clipper_g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", dim.plot.width)
        .attr("height", dim.size.main.height),

        main_chart_g = svg.append("g").attr("class", "_main_chart_g"),

        //******** AXIS */
        axis_g = main_chart_g.append("g").attr("class", "main_axis"),
        height = dim.position.axisheight,
        main_axis_g = mline.svg.main_axis_g(axis_g, 'all', { x, height }),

        //******BRUSH AXIS */
        height2 = dim.position.brushAxisHeight,
        brush_axis_g = _brush.setx2Axis(axis_g, height2),

        //******* GRID */
        grid_g = main_chart_g.append("g").attr("class", "grid"),
        grid_lines_g = mline.svg.setGridSVG(grid_g),


        //Bollinger ****************************/\

        bollinger_g = main_chart_g.append('g').attr("class", "bollinger_g"),
        bollinger_line_g = mline.plots.overlay.createOverlay(bollinger_g, 'bollinger'),



        //MA ****************************************************/
        //the ma group is set here by default to keep the layers normal. 
        ma_g = main_chart_g.append("g").attr("class", "ma_g"),
        ma_indicator_g = ma.svg.set_indicator_g(ma_g),

        //SUPPORT AND RESISTANCE LINES
        supstance_g = main_chart_g.append('g').attr("class", "supstance_g").style("pointer-events", 'all'),
        supstance_lines_g = mline.indicators.supstance.createSupstance(supstance_g),


        //	ATR Trailing Stop ****************************/\

        atrtrailingstop_g = main_chart_g.append('g').attr("class", "atrtrailingstop_g"),
        atrtrailingstop_line_g = mline.plots.overlay.createOverlay(atrtrailingstop_g, 'atrtrailingstop'),

        //EPS LINE CHART ****************************************************/

        eps_g = main_chart_g.append("g").attr("class", "eps_g"),
        eps_lines_g = eps.svg.setEPS(eps_g),



        //Target PRICE LINE CHART ****************************************************/

        tp_g = main_chart_g.append("g").attr("class", "tp_g"),
        tp_line_g = mline.plots.tp.createTp(tp_g),

        // LINE/CHANDLE ETC CHART
        main_line_holder_g = main_chart_g.append("g").attr("class", "main_line_holder_g"),
        main_line_g = mline.svg.main_line_g(main_line_holder_g),


        //ANNOTATION FOR CLOSEST PRICE******************************************** */
        closest_price_annotation_g = main_chart_g.append("g").attr("class", "close1 annotation up"),










        //CROSSHAIRS****************************************************** */

        main_chart_crosshair_g = main_chart_g.append('g').attr("class", "main_chart crosshair"),


        //Company EVENTS *********************************/

        events_g = main_chart_g.append("g")
        .attr("class", "events_g")
        .attr("clip-path", "url(#mClip_)"),

        historical_g = events_g.append("g").attr("class", "historical_g"),


        dividends_g = events_g.append("g").attr("class", "dividends_g"),

        flash_g = events_g.append("g").attr("class", "flash_g"),




        tradeArrow_g = main_chart_g.append('g').attr("class", "tradearrow_g"),
        tradearrow = mline.indicators.tradeArrows.createTradeArrows(tradeArrow_g),


        monitors_g = main_chart_g.append('g').attr("class", "monitors_g").attr("clip-path", "url(#mClip_)"),


        notes_g = main_chart_g.append('g').attr("class", "notes_g").attr("clip-path", "url(#mClip_)"),

        trendlines_g = main_chart_g.append('g').attr("class", "trendlines_g").attr("clip-path", "url(#mClip_)"),


        //INDICATORS ****************************************************** */

        indicator_clip_g = def_g.append("g").attr("class", "indicator_clip_g"),
        indicator_clip_f = indicator.svg.setIndicatorsClip({ svg: indicator_clip_g, dim: dim }),
        indicators_g = svg.append("g").attr("class", "indicators_g"),
        indicators_group_g = indicators_g.append("g").attr("class", "indicators_group_g"),
        indicators_crosshairs_g = indicators_g.append("g").attr("class", "indicators_crosshairs_g"),

        indicator_selector_g = indicator.svg.setIndicators({ svg: indicators_group_g, list: dim.position.modifiedList, x: x })

    //CROSSHAIRS****************************************************** */

    const indicatorCrosshairs = indicator.svg.setIndicatorsCrosshairs(indicators_crosshairs_g, config.indicator.selected)

    const hovers_g = svg.append('g').attr('class', 'hovers_g')

    const brushPane = _brush.setPane(dim)


    //************************************************************** */



    /****************************************************** */

    //** labels */
    const labels = {
        labels_g: svg.append("g").attr("class", "labels_g"),
        main_chart_label_g: svg.select('g.labels_g').append("g").attr("class", "main_chart_label"),
        indicators_label_g: svg.select('g.labels_g').append("g").attr("class", "indicators_label"),
        fnc: {}
    }

    //set borders around each chart
    const chart_borders = {}
    chart_borders.holder = svg_dim.append("g").attr("class", "chart_borders_g")
    chart_borders.main = chart_borders.holder.append('g').attr('class', 'main_border_g svg_borders')
    chart_borders.indicators = chart_borders.holder.append('g').attr('class', 'indicator_border_g svg_borders')

    mline.svg.set_main_border({ svg: chart_borders.main, width: dim.width, height: dim.border.main.height })
    indicator.svg.setIndicatorsBorder({ svg: chart_borders.indicators, dim: dim, list: dim.position.modifiedList }) //indicators borders

    //set handles on each chart
    const handles = {}
    handles.holder = svg_dim.append("g").attr("class", "chart_handles")
    handles.main = handles.holder.append('g').attr('class', 'main_chart_handles_g')
    handles.indicators = handles.holder.append('g').attr('class', 'indicator_handles_g')

    mline.svg.resizeHandle({ svg: handles.main, dim: dim, fnc: resizeH.resizeHandleEvent }) //drag handles to resize chart
    indicator.svg.resizeHandle({ svg: handles.indicators, dim: dim, set_dim: set_dim, fncs: { h: resizeH.resizeHandleEvent, v: swapV.swapHandleEvent }, x: x, list: dim.position.modifiedList })

    return {
        hoverDiv,
        svg_dim,
        svg,
        main_clip_rect,
        main_chart_g,
        main_line_holder_g,
        main_line_g,
        main_axis_g,
        brush_axis_g,
        brushPane,
        grid_g,
        grid_lines_g,
        main_chart_crosshair_g,
        closest_price_annotation_g,
        ma_g,
        ma_indicator_g,
        eps_g,
        eps_lines_g,
        tp_g,
        tp_line_g,
        events_g,
        indicator_clip_g,
        indicators_g,
        indicator_clip_f,
        indicator_selector_g,
        indicatorCrosshairs,
        indicators_group_g,
        indicators_crosshairs_g,
        chart_borders,
        handles,
        hovers_g,
        bollinger_g,
        atrtrailingstop_g,
        supstance_g,
        tradeArrow_g,
        monitors_g,
        trendlines_g,
        notes_g,
        labels
    }
})();

export default chart_svg;