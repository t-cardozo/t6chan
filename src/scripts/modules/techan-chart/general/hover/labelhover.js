import { line_type, set_dim } from '../../set_chart_variables'

function createMainHoverRect(svg, opts) {

    const $st_sec = $('#stamp_section');

    const rect = svg.append('rect')
        .attr('class', ((opts.type == 'main') ? 'ohlc_label_rect' : opts.type) + ' label_background_charts')
        .attr("x", 5)
        .attr("y", 5)
        .attr("height", 50)
        .attr("width", 200)
    //.style("visibility", "hidden")

    const rect_text_g = svg.append("g").attr("class", "rect_text_g")

    const text_symbol_name = rect_text_g.append('text')
        .attr("class", "symbol")
        .attr("id", "symbol_name")
        .attr("x", 5)
        .attr("y", 18)
        .style("opacity", 1)
        .attr("dx", "0.5em")
        .attr("visibility", ($('#stamp_section').is(":hidden")) ? 'visible' : 'hidden')
        .text('tee')


    const text_main_stats = rect_text_g.append('text')
        .attr("class", "symbol")
        .attr("id", "ohlclabel")
        .attr("dy", '1em')
        .attr("dx", "0.5em")
        .attr("x", 5)
        .attr("y", (!$st_sec.is(":hidden") && $st_sec.length) ? 5 : 19)
        .style("opacity", 1);

    const text_ma_stats = rect_text_g.append('text')
        .attr("class", "symbol")
        .attr("id", "mahoverText")
        .attr("dy", '2em')
        .attr("dx", "0.5em")
        .attr("x", 5)
        .attr("y", (!$st_sec.is(":hidden") && $st_sec.length) ? 6 : 20)
        .style("opacity", 1)


    const text_tp_stats = rect_text_g.append('text')
        .attr("id", "hover")
        .attr("class", "symbol")
        .style("opacity", 1)
        .attr("dy", '3em')
        .attr("dx", "0.5em")
        .attr("x", 5)
        .attr("y", (!$st_sec.is(":hidden") && $st_sec.length) ? 7 : 21)

    const text_eps_stats = rect_text_g.append('text')
        .attr("id", "eps_hover")
        .attr("class", "symbol")
        .style("opacity", 1)
        .attr("dy", '4em')
        .attr("dx", "0.5em")
        .attr("x", 5)
        .attr("y", (!$st_sec.is(":hidden") && $st_sec.length) ? 8 : 22)

    return { rect, rect_text_g, text_symbol_name, text_main_stats, text_ma_stats, text_tp_stats, text_eps_stats }
}

function setMainLabel(svg) {
    const { labels } = svg.datum();
    const {exchangeCode, symbol, symbolName} = getSelectedSecurity();
    if (labels.fnc.main_chart_label == null) labels.fnc.main_chart_label = createMainHoverRect(labels.main_chart_label_g, { type: 'main' });
    labels.fnc.main_chart_label.text_symbol_name.text(symbol + " : " + exchangeCode + " : "+symbolName)
}


function createIndicatorHover(svg) {

    const dim = set_dim();


    var indicator_g = svg.append("g").attr("class", (d) => "indicator_label " + d)

    indicator_g.append('rect').attr('class', (d) => "label_background_charts " + d)
        .attr("height", 30)
        .attr("width", 150)
        .attr("x", 5)
        .attr("y", function(d, i) {
            return (((dim.position.spacing[d]) + ((dim.size.indicator[d].height) / 2) - dim.size.indicator[d].padding));;
        })

    var indicator_text_g = indicator_g.append('g').attr('class', (d) => "indicator_label_text " + d)

    indicator_text_g.append('text')
        .attr("class", "symbol sub-chart-hover-param")
        .attr("id", function(d, i) {

            var id;
            if (d == 'volume') {
                id = 'volortv';
            } else {
                id = d + 'text';
            }
            return "sub-chart-hover-param-" + id;
        })
        .attr("dx", "0.5em")
        .style("opacity", 1)
        .attr("x", 5)
        .attr("y", function(d) {
            return (((dim.position.spacing[d]) + ((dim.size.indicator[d].height + dim.size.indicator[d].padding) / 2) - 10));
        })

    indicator_text_g.append('text')
        .attr("class", "symbol sub-chart-hover-value")
        .attr("id", function(d, i) {
            var id;
            if (d == 'volume') {
                id = 'volortv';
            } else {
                id = d + 'text';
            }
            return "sub-chart-hover-value-" + id;
        })
        .attr("dx", "0.5em")
        .style("opacity", 1)
        .attr("x", 5)
        .attr("y", function(d) {
            return (((dim.position.spacing[d]) + (dim.size.indicator[d].height / 2) - 3.5 + dim.size.indicator[d].padding));
        })

    d3.select('g.indicator_label.brush').remove(); //remove brush

}

var debounce_labelhover
function labelhover(opts) {
	if(debounce_labelhover != null) clearTimeout(debounce_labelhover);
	

		
    const { data, x, y, crosshair_e, labels, svg } = opts;
    const label_o = labels.fnc.main_chart_label;


    const index = (crosshair_e != null) ? x.invertToIndex(d3.mouse(crosshair_e)[0]) : data.length - 1
    let d = data[index];
    const dataPoint = (crosshair_e != null) ? x.invert(d3.mouse(crosshair_e)[0]) : 0;
    const bisectDate = d3.bisector(function(o) { return o.date; }).left;

	
	debounce_labelhover = window.setTimeout(function() {
		
    //** MAIN CHART HOVER */
    const firstclose = line_type().accessor()(data.slice.apply(data, x.zoomable().domain())[0])
    const currentpercentage = (d != null) ? Math.round(((d.close - firstclose) / firstclose) * 100) : 0
    let maValues = '';
	

	
    label_o.text_main_stats.text(() => {

        if (d != null) {
            switch (config.line.selected) {
                case 'candle':
                    return `Candlestick (OHLC) [${d.open.toFixed(2)}, ${d.high.toFixed(2)}, ${d.low.toFixed(2)}, ${d.close.toFixed(2)}] ${currentpercentage}%`
                    break;
                case 'close':
                case 'line':
                    return `Line (C) [${d.close.toFixed(2)}] ${currentpercentage}%`
                    break;
                case 'ohlc':
                    return `OHLC (OHLC) [${d.open.toFixed(2)}, ${d.high.toFixed(2)}, ${d.low.toFixed(2)}, ${d.close.toFixed(2)}] ${currentpercentage}%`
                    break;
                case 'heikinashi':
                    return `Heikin-Ashi (OHLC) [${d.open.toFixed(2)}, ${d.high.toFixed(2)}, ${d.low.toFixed(2)}, ${d.close.toFixed(2)}] ${currentpercentage}%`
                    break;
            }
        }
    })

    label_o.text_ma_stats.text(() => {
        let maText = ''
        const maData = []

        if (config.ma.selected != '' && config.ma.selected != 'none' && svg.ma_indicator_g != null) {

            svg.ma_indicator_g.each(function(d, i) {
                maData[i] = d3.select(this).selectAll('.ma-line-g').datum()
                if (config.ma.display()[i].show) {
                    let m = (crosshair_e != null) ? pinPointData(maData[i], dataPoint, bisectDate) : maData[i][maData[i].length - 1]
                    maValues += config.ma.display()[i].param + ', '
                    if (m != null) maText += m['value'].toFixed(2) + ', '
                }
            })

            maText = maText.slice(0, -2);
            maValues = maValues.slice(0, -2)
            label_o.text_tp_stats.attr('dy', (maValues == '') ? '2em' : '3em')
            label_o.text_eps_stats.attr('dy', (maValues == '') ? '3em' : '4em')

            return (maValues == '') ? '' : `${(config.ma.selected == "ema") ? 'EMA' : 'SMA'} (${maValues}) [${maText}]`
        }
    });

    label_o.text_tp_stats.attr('visibility', (config.tp) ? 'visible' : 'hidden').text(() => {

        var tpValcheck = (crosshair_e != null && d != null) ? d.tp.toFixed(2) : getlastValues(data, 'tp', 'N/A')
        var tpValue = (tpValcheck == 0) ? 'N/A' : '$' + tpValcheck
        label_o.text_eps_stats.attr('dy', (config.tp) ? maValues == '' ? '3em' : '4em' : maValues == '' ? '2em' : '3em')
        return "Target Price = " + tpValue
    });

    label_o.text_eps_stats.text(() => {
        var fullepsText = '';
        var epsmText = []
        if (crosshair_e == null) d = data[data.length - 2];

        if (d != null) {
            epsmText[0] = (config.eps.selected().includes('epsrolling1')) ? (d.epsrolling1 != 0 && !isNaN(d.epsrolling1)) ? 'Rolling FY1 = ' + d.epsrolling1.toFixed(2) + '| ' : '' : '';
            epsmText[1] = (config.eps.selected().includes('epsrolling2')) ? (d.epsrolling2 != 0 && !isNaN(d.epsrolling2)) ? 'Rolling FY2 = ' + d.epsrolling2.toFixed(2) + '| ' : '' : '';
            epsmText[2] = (config.eps.selected().includes('eps')) ? (d.eps0 != 0) ? 'EPS H1 = ' + d.eps0.toFixed(2) + '| ' : '' : '';
            epsmText[3] = (config.eps.selected().includes('eps')) ? (d.eps1 != 0) ? 'EPS F1 = ' + d.eps1.toFixed(2) + '| ' : '' : '';
            epsmText[4] = (config.eps.selected().includes('eps')) ? (d.eps2 != 0) ? 'EPS F2 = ' + d.eps2.toFixed(2) + '| ' : '' : '';
            epsmText[5] = (config.eps.selected().includes('eps')) ? (d.eps3 != 0) ? 'EPS F3 = ' + d.eps3.toFixed(2) + '| ' : '' : '';

            for (let i = 1; i < 15; i++) {
                var j = i + 1,
                    v = i + 5
                epsmText[v] = (config.eps.selected().includes('eps')) ? (d['epsm' + i] != 0) ? 'EPS H' + j + ' = ' + d['epsm' + i].toFixed(2) + '| ' : '' : '';
            }
            for (let i = 0; i <= 19; i++) fullepsText += epsmText[i]
            fullepsText = fullepsText.slice(0, -2);
            return fullepsText;
        }
    });


    label_o.rect.attr('width', (label_o.rect_text_g.node().getBoundingClientRect().width) + 5)
    label_o.rect.attr('height', label_o.rect_text_g.node().getBoundingClientRect().height)

    //******************************* */


    //** INDICATOR **/
    const indicator_g = d3.selectAll('g.indicator-group').selectAll('g.indicator .indicator-plot');

    const i_PinPoint = {};
    const indicator_array = config.indicator.selected;

    let count = 0;
    indicator_g.each((d, i) => {

        if (indicator_array[count] != null) i_PinPoint[indicator_array[count]] = (crosshair_e != null) ? pinPointData(d, dataPoint, bisectDate) : d[d.length - 1]
        count++;
    });

    for (let indicator in i_PinPoint) {
        let d = i_PinPoint[indicator]


        switch (indicator) {

            case 'volume':
                if (d != null) {
                    d3.select(`text#sub-chart-hover-param-volortv.symbol`).text((config.indicator.prop.volume.type == "volume") ? 'Volume (m)' : 'Value ($m)')
                    d3.select(`text#sub-chart-hover-value-volortv.symbol`).text(" [" + d.volume.toFixed(2) + "]")
                }
                break;
            case 'macd':
                if (d != null) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("MACD (" + config.indicator.prop.macd.signal + ", " + config.indicator.prop.macd.slow + ", " + config.indicator.prop.macd.fast + ")");
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text("[" + d.macd.toFixed(2) + ", " + d.signal.toFixed(2) + ", " + d.difference.toFixed(2) + "]");
                }
                break;
            case 'rsi':
                if (d != null) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("RSI (" + config.indicator.prop.rsi.period + ", " + config.indicator.prop.rsi.overbought + ", " + config.indicator.prop.rsi.oversold + ")")
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text("[" + d.rsi.toFixed(2) + "]")
                }
                break;
            case 'atr':
                if (d != null) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("ATR (" + config.indicator.prop.atr.period + ")")
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text(" [" + d.value.toFixed(2) + "]")
                }
                break;
            case 'pe_fy1':
                if (d.PE_Limit != null && !isNaN(d.PE_Limit)) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("PE FY1 (X, Avg, 2sd)")
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text((crosshair_e != null) ? "[" + d.PE_Limit.toFixed(2) + ", " + d.PE_Avg.toFixed(2) + ", " + d.PE_Std_P2.toFixed(2) + "]" : "[" + getlastValues(data, 'PE_Limit', 'N/A') + ", " + getlastValues(data, 'PE_Avg', 'N/A') + ", " + getlastValues(data, 'PE_Std_P2', 'N/A') + "]")
                }
                break;
            case 'evebitda':
                if (d.EVEBITDA != null && !isNaN(d.EVEBITDA)) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("EV/EBITDA FY1 (X, Avg, 2sd)")
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text((crosshair_e != null) ? "[" + d.EVEBITDA.toFixed(2) + ", " + d.EVEBITDA_Avg.toFixed(2) + ", " + d.EVEBITDA_Std_P2.toFixed(2) + "]" : "[" + getlastValues(data, 'EVEBITDA', 'N/A') + ", " + getlastValues(data, 'EVEBITDA_Avg', 'N/A') + ", " + getlastValues(data, 'EVEBITDA_Std_P2', 'N/A') + "]")
                }
                break;
            case 'yield':
                if (d.DIVY != null && !isNaN(d.DIVY)) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("Yield FY1 (X, Avg, 2sd)")
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text((crosshair_e != null) ? "[" + d.DIVY.toFixed(2) + ", " + d.DIVY_Avg.toFixed(2) + ", " + d.DIVY_Std_P2.toFixed(2) + "]" : "[" + getlastValues(data, 'DIVY', 'N/A') + ", " + getlastValues(data, 'DIVY_Avg', 'N/A') + ", " + getlastValues(data, 'DIVY_Std_P2', 'N/A') + "]")
                }
                break;
            case 'williams':
                if (d != null) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("Williams %R (" + config.indicator.prop[indicator].period + ")");
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text("[" + d.williams.toFixed(2) + "]")
                }
                break;
            case 'adx':
                if (d != null) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("ADX (" + config.indicator.prop[indicator].period + ")");
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text("[" + d.adx.toFixed(2) + ", " + d.plusDi.toFixed(2) + ", " + d.minusDi.toFixed(2) + "]")
                }
                break;
            case 'aroon':
                if (d != null) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("Aroon (" + config.indicator.prop[indicator].period + ", " + config.indicator.prop[indicator].overbought + ", " + config.indicator.prop[indicator].oversold + ")");
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text("[" + d.oscillator.toFixed(2) + ", " + d.up.toFixed(2) + ", " + d.down.toFixed(2) + "]")
                }
                break;
            case 'stochastic':
                if (d != null) {
                    d3.select(`text#sub-chart-hover-param-${indicator}text.symbol`).text("Stochastic (" + config.indicator.prop[indicator].period + ", " + config.indicator.prop[indicator].overbought + ", " + config.indicator.prop[indicator].oversold + ")");
                    d3.select(`text#sub-chart-hover-value-${indicator}text.symbol`).text("[" + d.stochasticD.toFixed(2) + ", " + d.stochasticK.toFixed(2) + "]")
                }
                break;

                //ADD THE REST HERE WHEN I TALK TO NIC ON WHAT 
        }
        d3.select('.label_background_charts.' + indicator).attr('width', ($('g.indicator_label_text.' + indicator)[0].getBoundingClientRect().width) + 15)
    }
}, 100);

}

function pinPointData(data, mousePoint, bisectDate) {

    try {
        var x0 = mousePoint,
            k = bisectDate(data, x0, 1),
            d0 = data[k - 1],
            d1 = data[k],
            g = x0 - d0.date > d1.date - x0 ? d1 : d0;
        return g;
    } catch (error) {}
}

function getlastValues(data, value, text) {
    var counter = data.length - 1;
    var lastval = 0;
    while (true) {
        counter--;
        let d = data[counter];

        if (counter == 0) {
            lastval = text;
            break;
        } else {
            if (d[value] != 0 && !isNaN(d[value])) {
                lastval = (!isNaN(d[value])) ? d[value].toFixed(2) : text;
                break;
            }
        }
    }
    return (!isNaN(lastval)) ? lastval : '0.00'; //0.00 or empty ask nic.
}

export default { createMainHoverRect, setMainLabel, labelhover, createIndicatorHover }