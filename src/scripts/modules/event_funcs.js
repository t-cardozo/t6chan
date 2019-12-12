import {
    set_dim,
    xU,
    x,
    x2,
    y,
    y_Eps,
    initalise_indicators,
    line_type_Crosshair,
    timeAnnotation,
    line_type,
    ma_Line
} from './techan-chart/set_chart_variables'
import m_line from './techan-chart/main-line/index'
import c_svg from './techan-chart/set_chart_svg'
import c_fnc from './techan-chart/chart_functions'
import ma from './techan-chart/ma/index'
import eps from './techan-chart/eps'
import _indicators_ from './techan-chart/indicators/index'
import { removeArrayElement } from './utils'
import resize from './techan-chart/general/resize'
import _brush from './techan-chart/general/brush'
import resizeH from './techan-chart/general/resizeHandler'
import swapV from './techan-chart/general/swapHandler'
import redraw from './techan-chart/general/redraw'
import hovers from './techan-chart/general/hover'

//******* LINE EVENT FUNCTIONS */
function changeLine(line_name) {
    //change line type Variable with new Line: 
    m_line.func.set_LineData(c_svg.main_line_holder_g, c_svg.main_line_holder_g.datum(), line_name)
    config.line.selected = line_name //change line name in config..
    m_line.func.set_LineType(c_svg.main_line_g, line_type())
    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: c_svg.main_line_holder_g.datum(), svg: { ma_indicator_g: c_svg.ma_indicator_g } })
}

//*************************** */

//******* MA EVENT FUNCTIONS */
function display_mas(action, ma_name) {

    if (!action) {
        config.ma.selected = 'none';
        c_svg.ma_indicator_g.remove();

        document.getElementById("maselection").style.display = "none";

    } else {
        config.ma.selected = ma_name;
        c_svg.ma_indicator_g = ma.svg.set_indicator_g(c_svg.ma_g) //select main ma group and set ma svgs in it..

        c_svg.ma_g.call(ma._function.set_ma_data, c_svg.ma_indicator_g)
        ma._function.execute_ma(c_svg.ma_indicator_g, ma_Line()) //render the data to the svg group created

        document.getElementById("maselection").style.display = "block";
    }

    c_svg.hovers_g.call(hovers.line.createHovers, c_svg.ma_indicator_g)
}

function changeMAType(ma_name) {
    if (config.ma.selected != 'none') {
        display_mas(true, ma_name);
    }

    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: c_svg.main_line_holder_g.datum(), svg: { ma_indicator_g: c_svg.ma_indicator_g } })
    c_svg.hovers_g.call(hovers.line.createHovers, c_svg.ma_indicator_g)

}


//*************************** */

//******* Indicator FUNCTIONS */
function displayIndicators(indicatorName, indicatorChecked) {

    const main_data = c_svg.main_line_holder_g.datum();
    const brush_data = c_svg.brushPane.datum().data

    //variables
    //   if (window.location.hostname != 'localhost') config.indicator.selected = getChartOrder();
    const indicatorList = config.indicator.selected;


    (indicatorChecked) ? indicatorList.push(indicatorName) : removeArrayElement(indicatorList, indicatorName)

    //reinialise dim.. then set the objects again..
    let dim = set_dim();

    //remove all the clip and crosshair and redraw later so no problems occur.
    c_svg.indicator_clip_f.remove()
    c_svg.indicator_clip_f = _indicators_.svg.setIndicatorsClip({ svg: c_svg.indicator_clip_g, dim: dim }) //set svg, data an render indicators.

    if (indicatorChecked) {
        c_svg.indicator_selector_g = _indicators_.svg.setIndicators({ svg: c_svg.indicators_group_g, list: [indicatorName], x: xU })
        _indicators_.svg.setIndicatorsBorder({ svg: c_svg.chart_borders.indicators, list: [indicatorName], dim: dim })
        _indicators_.svg.resizeHandle({ svg: c_svg.handles.indicators, dim: dim, list: [indicatorName], fncs: { h: resizeH.resizeHandleEvent, v: swapV.swapHandleEvent } })
        _indicators_.svg.setIndicatorsCrosshairs(c_svg.indicators_crosshairs_g, [indicatorName])

        let data = (indicatorName == 'volume' || indicatorName == 'yield' || indicatorName == 'pe_fy1' || indicatorName == 'evebitda') ? main_data : brush_data
        _indicators_.main.exeIndicator({ dim: dim, data: data, indicator: indicatorName, inicator_init: initalise_indicators(dim), x: x })
        indicatorList.forEach((indicatorName) => _indicators_.main.iCrosshair({ indicator: indicatorName, inicator_init: initalise_indicators(dim) }))

    } else {
        //remove indicator:

        c_svg.indicator_selector_g.filter(`g.${indicatorName}`).remove();
        c_svg.chart_borders.indicators.select(`g.${indicatorName}`).remove();

        d3.select(`g.indicator.crosshair.${indicatorName}`).remove();

        c_svg.handles.indicators.select(`g.${indicatorName}.drag-handle.H`).remove();
        c_svg.handles.indicators.selectAll(`g.${indicatorName}.drag-handle.V`).remove();

        indicatorList.forEach((indicatorName) => {
            _indicators_.main.refresh({ dim: dim, indicator: indicatorName, inicator_init: initalise_indicators(dim), x: x })
        });
    }

    //update height and y pos **
    c_svg.chart_borders.indicators.selectAll('rect')
        .attr('y', (d) => dim.position.spacing[d] + dim.size.main.padding)
        .attr("height", (d) => dim.border.indicator.height(d))


    c_svg.handles.indicators.selectAll('g.drag-handle.H rect')
        .attr("y", (d) => dim.border.indicator.handlePos(d))

    c_svg.handles.indicators.selectAll('g.drag-handle.V rect')
        .attr("y", (d) => dim.border.indicator.handlePosTop(d))
        .attr("height", (d) => dim.border.indicator.height(d))


    _brush.refresh({ dim: dim, x2: x2 })
    c_svg.brushPane.attr("transform", "translate(" + 0 + "," + (dim.position.spacing.brush) + ")");

    //update the posistioning of items
    c_svg.chart_borders.main.select('rect.main-border-rect-g').attr("height", dim.border.main.height)
    c_svg.handles.main.select('rect.drag-handle.ohlc').attr("y", dim.border.main.handlerPos)
    c_svg.main_axis_g.xAxis.attr("transform", "translate(0," + dim.position.axisheight + ")")
    c_svg.brush_axis_g.attr("transform", "translate(0," + dim.position.brushAxisHeight + ")")


    //update the annotation and wire for the main chart
    timeAnnotation.translate([0, dim.position.axisheight])
    line_type_Crosshair.verticalWireRange([0, dim.position.axisheight])

    c_fnc.reCalcSVGHeight(dim.newHeight)

    d3.selectAll('g.indicator_label').remove();
    d3.selectAll('g.indicator-group').call(hovers.label.createIndicatorHover)

    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: c_svg.main_line_holder_g.datum(), svg: { ma_indicator_g: c_svg.ma_indicator_g } })
    c_svg.hovers_g.call(hovers.line.createHovers, c_svg.ma_indicator_g)

    c_svg.svg.selectAll("g.crosshair").on('mousemove', null).on("mousemove", function (d) {
        hovers.line.lineHover({ data: { main_data: main_data, brush_data: brush_data }, x: x, yMain: y, y2: y_Eps, crosshair_e: this, svg: c_svg.hovers_g })
        hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: this, data: main_data, svg: { ma_indicator_g: c_svg.ma_indicator_g } })
    });
}


//******* EPS FUNCTIONS */
function displayEPS(checked, eps_name) {

    // const eps_name = epsType.getAttribute('data-eps')
    const epsList = config.eps.selected()
    const check = (checked) ? epsList.push(eps_name) : removeArrayElement(epsList, eps_name)

    //remove all the eps, so no problems are caused
    c_svg.eps_g.selectAll("*").remove();
    c_svg.eps_lines_g = eps.svg.setEPS(c_svg.eps_g)

    c_svg.eps_g.call(eps.fnc.setDomain).call(eps.fnc.exe, c_svg.eps_lines_g)

    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: c_svg.main_line_holder_g.datum(), svg: { ma_indicator_g: c_svg.ma_indicator_g } })
    c_svg.hovers_g.call(hovers.line.createHovers, c_svg.ma_indicator_g) //this creates the new hover circles.
}

function displayRSLine(display) {
    if (display) {
        config.line.indicators.supstance = true;
        if (c_svg.supstance_g.select('g.supstances').empty()) m_line.indicators.supstance.createSupstance(c_svg.supstance_g)
        m_line.indicators.supstance.exe(c_svg.supstance_g)
    } else {
        config.line.indicators.supstance = false;
        c_svg.supstance_g.select('g.supstances').selectAll('*').remove();
    }
}

function displayEvents(display, eventType, id) {
    if (display) {
        config.line.indicators.events[eventType].show = true;
        c_svg.events_g.select(id)
            .call(m_line.indicators.companyevents.createNodes)
            .call(m_line.indicators.companyevents.pos, { x: x, y: y })

    } else {
        config.line.indicators.events[eventType].show = false;
        c_svg.events_g.select(id).selectAll('*').remove();
    }
}

function displayTP(display) {

    if (display) {
        config.tp = true;
        if (c_svg.tp_g.select('g.tp-line').empty()) c_svg.tp_g.call(m_line.plots.tp.createTp)
        c_svg.tp_g.call(m_line.plots.tp.domain, true)
        resize.redraw({ dim: set_dim() })
        c_svg.tp_g.call(m_line.plots.tp.exe)


    } else {
        c_svg.tp_g.call(m_line.plots.tp.domain, false)
        resize.redraw({ dim: set_dim() })
        c_svg.tp_g.select('g.tp-line path').attr('d', '')
        config.tp = false;
    }
    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: c_svg.main_line_holder_g.datum(), svg: { ma_indicator_g: c_svg.ma_indicator_g } })
    c_svg.hovers_g.call(hovers.line.createHovers, c_svg.ma_indicator_g)

}
//*************************** */

function changeVolumeType(volume) {
    if (!_indicators_.main.checkIndicator('volume')) return false;

    const dim = set_dim();

    const data = d3.select(`g.main-line-chart`).datum();
    config.indicator.prop.volume.type = (volume == 'tradevalue') ? 'value' : 'volume'

    _indicators_.main.exeIndicator({ dim: dim, data: data, indicator: 'volume', inicator_init: initalise_indicators(dim), x: x })

    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: c_svg.main_line_holder_g.datum(), svg: { ma_indicator_g: c_svg.ma_indicator_g } })
    c_svg.hovers_g.call(hovers.line.createHovers, c_svg.ma_indicator_g)

}

function changeSymbol(opts,  callback = () => '') {
    config.data.symbol = opts.input;
    c_fnc.init('change-symbol', callback)

}

function changeCalender(opts, callback = () => '') {
	config.data.c = opts;
	c_fnc.init('change-symbol', callback)
}
//******* RESIZE EVENT FUNCTIONS */

//TODO Make an overall efficent resizing function!
function resizeChart() {

    config.display_settings.size.width = $('#chartcanvas').width();
    resize.resizeChart()
}
//*************************** */

function maCheckbox(check, maCount, maType) {
    const ma_props = config.ma.display();
    const checkedVal = (check) ? 1 : 0;


    ma_props[maCount].show = checkedVal;

    display_mas(false, maType)
    display_mas(true, maType.toLowerCase())
}

let maTimeout = null;

function maInput(value, maCount, maType) {
    if (maTimeout) clearTimeout(maTimeout);

    maTimeout = setTimeout(function () {
        const ma_props = config.ma.display();
        ma_props[maCount].param = value;
        display_mas(false, maType)
        display_mas(true, maType.toLowerCase())
    }, 250);
}

function saveNotes(data, date_array) {
    c_svg.notes_g.datum({ data: data, x: x, y: y, date_array: date_array })
        .call(m_line.indicators.notes.createNodes).call(m_line.indicators.notes.pos)
}

function displayMonitors(display, monitorName) {
    config.line.indicators.monitors[monitorName] = (display) ? true : false;
    c_svg.monitors_g.call(m_line.indicators.monitors.createNodes).call(m_line.indicators.monitors.pos)
}

function displayTrades(display, tradeName) {
    config.line.indicators.tradearrow[tradeName].show = (display) ? true : false;
    c_svg.tradeArrow_g.call(m_line.indicators.tradeArrows.exe)
}

function indicatorParams(indicator) {
    const brush_data = d3.select(`g.brush .indicator-plot`).datum();
    const dim = set_dim();

    switch (indicator) {
        case 'rsi':
            config.indicator.prop[indicator].overbought = $(`#${indicator}highinput`).val();
            config.indicator.prop[indicator].oversold = $(`#${indicator}lowinput`).val();
            config.indicator.prop[indicator].period = $(`#${indicator}periodinput`).val();
            break;
        case 'atr':
            config.indicator.prop[indicator].period = $(`#${indicator}periodinput`).val();
            break;
        case 'macd':
            config.indicator.prop[indicator].signal = $('#macdsignalinput').val();
            config.indicator.prop[indicator].fast = $('#macdfastinput').val();
            config.indicator.prop[indicator].slow = $('#macdslowinput').val();
            break;
        case 'aroon':
        case 'stochastic':
            config.indicator.prop[indicator].overbought = $(`#${indicator}_overbought`).val();
            config.indicator.prop[indicator].oversold = $(`#${indicator}_oversold`).val();
            config.indicator.prop[indicator].period = $(`#${indicator}_period`).val();
            break;
        case 'adx':
        case 'williams':
            config.indicator.prop[indicator].period = $(`#${indicator}_period`).val();
    }

    _indicators_.main.exeIndicator({ dim: dim, data: brush_data, indicator: indicator, inicator_init: initalise_indicators(dim), x: x })
    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: c_svg.main_line_holder_g.datum(), svg: { ma_indicator_g: c_svg.ma_indicator_g } })
}

function redrawChart() {
    if (window.location.hostname == 'localhost') {
        config.line.selected = 'close';
        config.indicator.selected = ["williams", "volume", "evebitda", "yield", "rsi", "macd", "atr"]
        config.ma.display = () => {
            return [{
                param: 20,
                show: 1
            },
            {
                param: 30,
                show: 1
            },
            {
                param: 150,
                show: 1
            }
            ]
        }
        config.indicator.prop.volume.type = 'value'
        //   config.eps.selected = () => ['eps', 'epsrolling1']
        config.tp = true;
        //   config.line.indicators.events.companynews.show = true;
        //   config.line.indicators.events.dividends.show = false;
        config.line.indicators.monitors.volume_spike = true;
        config.line.overlay.selected = 'atrtrailingstop';
        config.line.indicators.supstance = true;
        changePortfolioArrows('bhp', 105)
    }

    redraw.redrawChart()
}



function updateEventsSetting(id) {

    c_svg.events_g.select(id).selectAll('*').remove();

    c_svg.events_g.select(id)
        .call(m_line.indicators.companyevents.createNodes)
        .call(m_line.indicators.companyevents.pos, { x: x, y: y })
}

function updateTradeArrowSetting() {


    c_svg.tradeArrow_g.selectAll('*').remove();
    m_line.indicators.tradeArrows.createTradeArrows(c_svg.tradeArrow_g)
    c_svg.tradeArrow_g.call(m_line.indicators.tradeArrows.exe)

}

const updateMonitorSettings = () => c_svg.monitors_g.call(m_line.indicators.monitors.createNodes).call(m_line.indicators.monitors.pos)


function updateOverlay(overlay) {

    if (overlay == 'bollinger') {
        config.line.overlay.bollinger.show = $('#dsp_bollinger').is(':checked');
        config.line.overlay.bollinger.prop.period = $('#bollingerperiodinput').val();
        config.line.overlay.bollinger.prop.sd = $('#bollingersdinput').val()
    }

    if (overlay == 'atrtrailingstop') {
        config.line.overlay.atrtrailingstop.show = $('#dsp_atr_trailing_stop').is(':checked');
        config.line.overlay.atrtrailingstop.prop.period = $('#atr_trailing_stop_period').val();
        config.line.overlay.atrtrailingstop.prop.multiplier = $('#atr_trailing_stop_multiplier').val();
    }
    const overlay_g = (overlay == 'bollinger') ? c_svg.bollinger_g : c_svg.atrtrailingstop_g
    const brush_data = d3.select(`g.brush .indicator-plot`).datum();
    overlay_g.selectAll('*').remove();
    m_line.plots.overlay.createOverlay(overlay_g, overlay)
    overlay_g.datum({ data: brush_data, x: x, y: y, overlay: overlay }).call(m_line.plots.overlay.exe)
}

function changePortfolioArrows(symbol, portfolioID) {

    const brush_data = d3.select(`g.brush .indicator-plot`).datum();
    const categoryname = $("#sel-portfolio option:selected").parent().attr('label');

    const tradeData = c_svg.tradeArrow_g.datum().data.filter((d) => !d.type.includes('portfolio'));



    $.get('/halo/report/inc_research_summary_chart_v2_portfolio.cfm?pfid=' + portfolioID + '&sym=' + symbol + '&s=' + config.data.s + '&e=' + config.data.e, (data) => {

        const portfolioData = $.map(JSON.parse(data), (d) => {
            try {
                return {
                    date: brush_data[d.SymbolIndex - 1].date,
                    type: d.type,
                    tradeurl: '',
                    price: +d.TradePrice,
                    hover: (d.type == 'buy-portfolio' ? 'Buy' : 'Sell') + ' ' + d.Quantity + ' shares @ ' + d.TradePrice
                }
            } catch (e) { }
        })

        const newTradeData = tradeData.concat(portfolioData);
        c_svg.tradeArrow_g.datum({ data: newTradeData, x: x, y: y }).call(m_line.indicators.tradeArrows.exe)

        $.ajax({
            url: "report/ASRAjaxCalls/inc_portfolio_ajax.cfm?tabname=time_series&chartType=none&datatype=savelastselection",
            type: "POST",
            data: { "cusportfolioid": portfolioID, "categoryname": categoryname },
            dataType: "text",
            error: (error) => console.log(error),
        });

    });

}




//public functions for unknown accessors 
chart_api['changeSymbol'] = changeSymbol;
chart_api['changeCalender'] = changeCalender;
chart_api['changeLine'] = changeLine;
chart_api['displayIndicators'] = displayIndicators;
chart_api['resize'] = resizeChart;
chart_api['displayRSLine'] = displayRSLine;
chart_api['displayEvents'] = displayEvents;
chart_api['displayTP'] = displayTP;
chart_api['displayEPS'] = displayEPS;
chart_api['ma'] = { display_mas, maCheckbox, maInput };
chart_api['notes'] = { saveNotes }
chart_api['displayMonitors'] = displayMonitors;
chart_api['displayTrades'] = displayTrades;
chart_api['indicatorParams'] = indicatorParams;
chart_api['changeVolumeType'] = changeVolumeType;
chart_api['redrawChart'] = redrawChart;
chart_api['updateTrendline'] = m_line.plots.trendline.updateTrendLine
chart_api['updateEventsSetting'] = updateEventsSetting;
chart_api['updateOverlay'] = updateOverlay;
chart_api['changePortfolioArrows'] = changePortfolioArrows;
chart_api['updateTradeArrowSetting'] = updateTradeArrowSetting;
chart_api['updateMonitorSettings'] = updateMonitorSettings;

export default {
    changeLine,
    display_mas,
    changeMAType,
    displayIndicators,
    displayEPS,
    resizeChart,
    changeSymbol,
	changeCalender,
    changeVolumeType,
    displayRSLine,
    displayEvents,
    displayTP,
    maCheckbox,
    maInput,
    displayMonitors,
    displayTrades,
    indicatorParams,
    redrawChart
}