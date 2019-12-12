import _svg from './indicator_svg'
import { createDomain, dbFormatDate } from '../../utils'

function checkIndicator(indicator) {
    const indicatorList = ((config || {}).indicator || {}).selected;
    return indicatorList.includes(indicator);
    //  return (name != '' && name != 'none')
}

function setIndicator(name, accessor, x, y) {

    let indicator
    if (name == 'yield' || name == 'pe_fy1' || name == 'evebitda') {

        var custom_indicator_module = new sub_chart_indicator();

        indicator = custom_indicator_module.custom_indicator()
            .xScale(x)
            .yScale(y)

        if (name == 'pe_fy1') indicator = indicator.values(['PE_Limit', 'PE_Avg', 'PE_Std_P2'])
        if (name == 'yield') indicator = indicator.values(['DIVY', 'DIVY_Avg', 'DIVY_Std_P2'])
        if (name == 'evebitda') indicator = indicator.values(['EVEBITDA', 'EVEBITDA_Avg', 'EVEBITDA_Std_P2'])

    } else {

        indicator = techan.plot[name]()
            .xScale(x)
            .yScale(y)

        if (name == 'volume')
            indicator = indicator.accessor(techan.accessor.ohlc()) // For volume bar highlighting

    }
    return indicator;
}

const setIndicatorAxis = (direction, y, format, ticks) => {
    let axis = d3['axis' + direction](y).ticks(ticks).tickFormat(d3.format(format));
    return axis;
}

function setIndicatorAnnotation(indicatorAxis, opts) {
    let indicator = techan.plot.axisannotation().axis(indicatorAxis)

    if (opts.orient != null) indicator = indicator.orient(opts.orient)
    if (opts.format != null) indicator = indicator.format(opts.format)
    if (opts.translate != null && opts.orient == 'right') indicator = indicator.translate(opts.translate)

    return indicator;
}

function setIndicatorCrosshair(xAnnotation, yAnnotation, height) {

    const crosshair = techan.plot.crosshair()
        .xScale(xAnnotation[0].axis().scale())
        .yScale(yAnnotation[1].axis().scale())
        .xAnnotation(xAnnotation)
        .yAnnotation(yAnnotation)
        .verticalWireRange([0, height])

    return crosshair;
}

function genertateIData(indicator, data) {

    let iData;

    const prop = config.indicator.prop[indicator];
    iData = (indicator != 'volume' && indicator != 'yield' && indicator != 'pe_fy1' && indicator != 'evebitda') ? techan.indicator[indicator]() : iData

    switch (indicator) {

        case 'rsi':
            iData = iData.period(prop.period).overbought(prop.overbought).oversold(prop.oversold)
        case 'atr':
            iData = iData.period(prop.period)
            break;
        case 'macd':
            iData = iData.signal(prop.signal).fast(prop.fast).slow(prop.slow)
            break;
        case 'aroon':
            iData = iData.period(prop.period).overbought(prop.overbought).oversold(prop.oversold)
            break;
        case 'adx':
            iData = iData.period(prop.period)
            break;
        case 'stochastic':
            iData = iData.period(prop.period).overbought(prop.overbought).oversold(prop.oversold)
            break;
        case 'williams':
            iData = iData.period(prop.period)
            break;
    }
    iData = (indicator == 'volume' || indicator == 'yield' || indicator == 'pe_fy1' || indicator == 'evebitda') ? data : iData(data)


    if (indicator == 'volume') {
        const volumeType = config.indicator.prop[indicator].type

        iData = iData.map((d, i) => {
            return {
                date: d.date,
                volume: (volumeType == 'value') ? d['tradevalue'] : d['volume'],
                open: +d.open,
                high: +d.high,
                low: +d.low,
                close: +d.close,
            }
        });
    }
    return iData;
}

function loopOnKeys(data, keys) {
    let arr = []
    data.forEach(d => keys.forEach(key => (d[key] != 0) ? arr.push((isNaN(d[key])) ? null : d[key]) : ''))

    return arr
}




function domain(opts) {
    const { dim, data, indicator, x } = opts;
    if (indicator == 'yield' || indicator == 'pe_fy1' || indicator == 'evebitda') {

        if (indicator == 'pe_fy1') dim.position.iScale[indicator].domain(createDomain(loopOnKeys(data, ['PE_Avg', 'PE_Limit', 'PE_Std_P2'])))
        if (indicator == 'evebitda') dim.position.iScale[indicator].domain(createDomain(loopOnKeys(data, ['EVEBITDA', 'EVEBITDA_Avg', 'EVEBITDA_Std_P2'])))
        if (indicator == 'yield') dim.position.iScale[indicator].domain(createDomain(loopOnKeys(data, ['DIVY', 'DIVY_Avg', 'DIVY_Std_P2'])))

    } else {

        const xdom = x.domain();
        const dateRange = [moment(xdom[0]).format('YYYY-MM-DD'), moment(xdom[xdom.length - 1]).format('YYYY-MM-DD')];

        var indicatorRange = []
        for (let i in data) {
            let dataRow = data[i]
            let data_date = moment(dataRow.date).format('YYYY-MM-DD')
            if (data_date == dateRange[0]) indicatorRange.push(i)
            if (data_date == dateRange[1]) indicatorRange.push(i)
        }
        indicatorRange = indicatorRange.map(Number);
        let indicatorSliced = data.slice.apply(data, indicatorRange)

        let iDomain = techan.scale.plot[indicator](indicatorSliced).domain();
        dim.position.iScale[indicator].domain(iDomain)

    }

}

function exeIndicator(opts) {



    const { dim, indicator, data, inicator_init, x } = opts

    let iData = genertateIData(indicator, data);

    domain({ data: iData, dim: dim, indicator: indicator, x: x })

    //render axis
    d3.select(`g.${indicator} .axis.left`).call(inicator_init.indicatorsAxis.Left[indicator]);
    d3.select(`g.${indicator} .axis.right`).call(inicator_init.indicatorsAxis.Right[indicator]);

    //render chart
    d3.select(`g.${indicator} .indicator-plot`).datum(iData).call(inicator_init.indicators[indicator]);

    //render indicator crosshairs
    iCrosshair({ indicator: indicator, inicator_init: inicator_init })
    _svg.updateClips(d3.select('g.indicators_g'))

}

const iCrosshair = (o) => d3.select(`g.crosshair.${o.indicator}`).call(o.inicator_init.indicatorsCrosshair[o.indicator]);

function refresh(opts) {

    const { dim, indicator, inicator_init, x } = opts

    //coud improve the domain.. why not needing to set all the time...
    const data = d3.select(`g.${indicator} .indicator-plot`).datum();

    domain({ data: data, dim: dim, indicator: indicator, x: x })

    //refresh axis
    d3.select(`g.${indicator} .axis.left`).call(inicator_init.indicatorsAxis.Left[indicator]);
    d3.select(`g.${indicator} .axis.right`).call(inicator_init.indicatorsAxis.Right[indicator]);

    //refresh chart

    if (indicator == 'yield' || indicator == 'pe_fy1' || indicator == 'evebitda') {
        d3.select(`g.${indicator} .indicator-plot`).call(inicator_init.indicators[indicator]);
    } else {
        d3.select(`g.${indicator} .indicator-plot`).call(inicator_init.indicators[indicator].refresh);
    }
    //refresh indicator crosshairs
    d3.select(`g.crosshair.${indicator}`).call(inicator_init.indicatorsCrosshair[indicator].refresh);
    _svg.updateClips(d3.select('g.indicators_g'))
}

const p = {
    genertateIData,
    checkIndicator,
    domain,
    setIndicator,
    setIndicatorAxis,
    setIndicatorAnnotation,
    setIndicatorCrosshair,
    exeIndicator,
    iCrosshair,
    refresh
}

export default p;