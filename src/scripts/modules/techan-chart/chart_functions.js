import {
    set_dim,
    line_type,
    xAxis,
    xAxis2,
    yAxis,
    percentAxis,
    line_type_Crosshair,
    closeAnnotation,
    x,
    x2,
    y,
    yPercent,
    y_Eps,
    accessor,
    ma_Line,
    initalise_indicators,
} from './set_chart_variables'
import chart_svg from './set_chart_svg'
import { composeData } from './construct_chart_data'
import ma from './ma'
import eps from './eps'
import mline from './main-line'
import indicator from './indicators'
import _brush from './general/brush'
import events from '../events'
import hovers from './general/hover'

function deploy_data(jsonData) {
    let { main_line_holder_g, closest_price_annotation_g, ma_indicator_g, ma_g } = chart_svg

    const { main_data, frequency_data } = jsonData;
    //Add data to the elments to draw on init function..
    mline.func.set_LineData(main_line_holder_g, main_data)
    closest_price_annotation_g.datum([main_data[main_data.length - 1]])

    ma_g.datum({ data: frequency_data }).call(ma._function.set_ma_data, ma_indicator_g)    //set ma data from module

}


function init(action, callback = () => '') {

    let {
        svg,
        main_line_g,
        main_axis_g,
        main_chart_crosshair_g,
        closest_price_annotation_g,
        ma_indicator_g,
        eps_lines_g,
        eps_g,
        tp_g,
        brush_axis_g,
        grid_lines_g,
        events_g,
        hovers_g,
        bollinger_g,
        atrtrailingstop_g,
        supstance_g,
        tradeArrow_g,
        monitors_g,
        trendlines_g,
        notes_g,
        labels,

    } = chart_svg

    //set any remaining data..
    if (action == 'change-symbol') {


        const brushDays = Number($('#brushDays').val()) || 500
        const endDate = moment(x2.domain()[x2.domain().length - 1]).format('YYYY-MM-DD');
        var startDate = moment(endDate).subtract(brushDays, 'days').format('YYYY-MM-DD');

        config.data.s = startDate;
        config.data.e = endDate;
    }

    const currentPortfolio = ($('#sel-portfolio').children('option:first-child').is(':selected')) ? '' : $('#sel-portfolio option:selected').val();
    let url = `report/ASRAjaxCalls/inc_research_summary_ajax_v3.cfm?p=RSP_RESEARCH_CENTRE&charttype=techchart&datatype=asrfeed&SCD=${config.data.symbol}&s=${config.data.s}&e=${config.data.e}&c=${config.data.c}&c_events=true&c_divid=true&c_monitor=true&c_flash=true&c_sandr=true&c_trend=true&c_portfolioid=${(currentPortfolio != null) ? currentPortfolio : 0}&c_notes=true`;

    d3.json(url, function (json) {
        //   requestData({ symbol: config.data.symbol, s: config.data.s, e: config.data.e }).then(jsonData => {
        const jsonData = composeData(json);
        const {
            main_data,
            brush_data,
            frequency_data,
            date_array,
            companynews_data,
            dividend_data,
            flash_data,
            sandr_data,
            trade_data,
            monitor_data,
            trendline_data,
            notes_data
        } = jsonData;

        const dim = set_dim();
        deploy_data(jsonData);
        _set_Domains(main_data);

        tp_g.datum({ data: main_data, y: y, init: mline.plots.tp.initialiseTP({ x: x, y: y }) }).call(mline.plots.tp.domain, true).call(mline.plots.tp.exe)

        let grid = mline.func.initialiseGrid(dim, x, y)
        mline.func.renderGrid(grid_lines_g, grid);

        _set_CloseAnnotation(closest_price_annotation_g);


        //brush *** 
        if (action != 'brushed') {
            _brush.domain({ x: x2, data: brush_data, accessor: line_type().accessor() })
            _brush.exe({ dim: dim, data: brush_data, x: x, x2: x2, fnc: init })
            _brush.resetBrushSelection({ dim: dim, x2: x2 });
        }

        mline.func.renderAxis(brush_axis_g, xAxis2)

        //********* */


        mline.func.set_LineType(main_line_g, line_type());

        mline.func.renderAxis(main_axis_g['xAxis'], xAxis)
        mline.func.renderAxis(main_axis_g['yAxis'], yAxis)
        mline.func.renderAxis(main_axis_g['percentAxis'], percentAxis)

        _set_MainCrosshairs(main_chart_crosshair_g, config.indicator.selected);

        ma._function.execute_ma(ma_indicator_g, ma_Line());

        eps_g.datum({ data: main_data, x: x, y: y_Eps }).call(eps.fnc.exe, eps_lines_g)

        hovers_g.call(hovers.line.createHovers, ma_indicator_g) //this creates the new hover circles.

        events_g.select('g.historical_g').datum({ d: companynews_data, type: 'companynews' })
            .call(mline.indicators.companyevents.createNodes)
            .call(mline.indicators.companyevents.pos, { x: x, y: y })

        events_g.select('g.dividends_g').datum({ d: dividend_data, type: 'dividends' })
            .call(mline.indicators.companyevents.createNodes)
            .call(mline.indicators.companyevents.pos, { x: x, y: y })

        events_g.select('g.flash_g').datum({ d: flash_data, type: 'flash' })
            .call(mline.indicators.companyevents.createNodes)
            .call(mline.indicators.companyevents.pos, { x: x, y: y })


        bollinger_g.datum({ data: frequency_data, x: x, y: y, overlay: 'bollinger' }).call(mline.plots.overlay.exe)

        atrtrailingstop_g.datum({ data: frequency_data, x: x, y: y, overlay: 'atrtrailingstop' }).call(mline.plots.overlay.exe)

        supstance_g.datum({ data: sandr_data, x: x, y: y }).call(mline.indicators.supstance.exe)

        tradeArrow_g.datum({ data: trade_data, x: x, y: y }).call(mline.indicators.tradeArrows.exe)

        monitors_g.datum({ data: monitor_data, x: x, y: y }).call(mline.indicators.monitors.createNodes).call(mline.indicators.monitors.pos)

        notes_g.datum({ data: notes_data, x: x, y: y, date_array: date_array }).call(mline.indicators.notes.createNodes).call(mline.indicators.notes.pos)

        trendlines_g.datum({
            data: trendline_data,
            date_data: date_array,
            x: x,
            y: y,
            set_dim: set_dim,
            main_data: main_data
        }).call(mline.plots.trendline.createTrendLine, { action: 'load', data: {} }).call(mline.plots.trendline.exe)


        //sets line circle hovers that get line info 

        //************* INDICATORS */
        config.indicator.selected.forEach((indicatorName) => {
            const data = (indicatorName == 'volume' || indicatorName == 'yield' || indicatorName == 'pe_fy1' || indicatorName == 'evebitda') ? main_data : frequency_data;
            indicator.main.exeIndicator({ dim: dim, data: data, indicator: indicatorName, inicator_init: initalise_indicators(dim), x: x })
        });
        //************** */



        //* labels */
        labels.main_chart_label_g.datum({ labels: labels }).call(hovers.label.setMainLabel)
        hovers.label.labelhover({ labels: labels, x: x, y: y, crosshair_e: null, data: main_data, svg: { ma_indicator_g } })


        svg.selectAll("g.crosshair").on('mousemove', null).on("mousemove", function () {
            hovers.line.lineHover({ data: { main_data, frequency_data }, x: x, yMain: y, y2: y_Eps, crosshair_e: this, svg: hovers_g })
            hovers.label.labelhover({ labels: labels, x: x, y: y, crosshair_e: this, data: main_data, svg: { ma_indicator_g } })
        });


        reCalcSVGHeight(dim.newHeight) //resize svg
        events(jsonData); //execute events

        
        var ticks = d3.selectAll(".x.axis2 .tick text");
        
        ticks.style("opacity", 1);

        if(ticks.size() >= 25) {
            ticks.attr("class", function(d,i){
                if(i%2 != 0) d3.select(this).style("opacity", 0);
            });
        }

        callback();
        $('#ASRChart').css("opacity", 1)
        $('#ASRChart').show();
        $('#loading').hide();
    })
}




//setters that take part in rendering components of chart
const _set_CloseAnnotation = (svg) => svg.call(closeAnnotation);
const _set_MainCrosshairs = (svg) => svg.call(line_type_Crosshair);

const reCalcSVGHeight = (height) => {
    d3.select('svg#summary_chart').attr('height', height)
    $('.vbtnbar').height(height);
}

function _set_Domains(data) {
    //setters to initialise the x and y domain
    x.domain(data.map(accessor.d));
    const yDomainRange = techan.scale.plot.ohlc(data, accessor).domain()
    yDomainRange[0] = yDomainRange[0] * 0.95
    yDomainRange[1] = yDomainRange[1] / 0.95
    y.domain(yDomainRange).nice();
    yPercent.domain(techan.scale.plot.percent(y, accessor(data[0])).domain());
}



//public chart functions access for api.
const chart_functions = {
    reCalcSVGHeight,
    deploy_data,
    init
}

export default chart_functions