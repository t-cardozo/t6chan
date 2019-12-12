let div = null;
let g = {}
const check = () => config.line.indicators.monitors


function template(selector, data) {

    const m_s = settings(data);
    //.log(m_s);
    selector.append("path")
        .attr("class", (d, i) => m_s.mon_class[i])
        .classed("monitor_timeseries", true)
        .attr('d', d3.symbol()
            .size((d, i) => (m_s.mon_class_v2[i] != null) ? m_s.mon_class_v2[i].size : 30)
            .type(d3.symbolTriangle))
        .style("cursor", "pointer")
        .style("fill", (d, i) => (m_s.mon_class_v2[i] != null) ? m_s.mon_class_v2[i].color : 'rgba(' + d.rgba + ')')
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .on("mouseover", monitorEnter)
        .on("mouseout", monitorExit);
}

function monitorEnter(d) {
    div.transition()
        .duration(200)
        .style("opacity", .95);
    div.html(d.desc)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
}

function monitorExit(d) {
    div.transition().duration(200).style("opacity", 0);
}


function settingsJson() {
    const monitors_settings = (window.location.hostname == 'localhost') ? {
        "big_candle": { "color": "rgb(255, 215, 0)", "size": "30", "deviation": "5" },
        "engulfing_bearish": { "color": "rgb(255,215,0)", "size": "30", "deviation": "5" },
        "engulfing_bullish": { "color": "rgb(65,105,225)", "size": "30", "deviation": "5" },
        "extreme_overbought": { "color": "rgb(255, 0, 0)", "size": "30", "deviation": "5" },
        "extreme_oversold": { "color": "rgb(65, 105, 225)", "size": "30", "deviation": "5" },
        "fakey_shakey_long": { "color": "rgb(0, 191, 255)", "size": "30", "deviation": "5" },
        "fakey_shakey_short": { "color": "rgb(255, 99, 71)", "size": "30", "deviation": "5" },
        "near_resistance": { "color": "rgb(255, 255, 0)", "size": "30", "deviation": "5" },
        "near_support": { "color": "rgb(255, 255, 0)", "size": "30", "deviation": "5" },
        "recent_earnings_downgrade": { "color": "rgb(255, 165, 0)", "size": "30", "deviation": "5" },
        "recent_earnings_upgrade": { "color": "rgb(148, 0, 211)", "size": "30", "deviation": "5" },
        "volume_spike": { "color": "rgb(50, 205, 50)", "size": "30", "deviation": "5" }
    } : JSON.parse($('#showflashJSON').val())

    return monitors_settings;
}

function settings(monitor_data) {


    const monitors_settings = settingsJson();


    const mon_class_v2 = []
    const mon_class = []
    const mon_classname_v2 = []

    for (let i in monitor_data) {
        let monitor = monitor_data[i].desc;

        let classname = monitor.toLowerCase().replace(/ /g, "_");
        let classname_v2 = classname.replace(/-/g, "");
        classname_v2 = classname_v2.replace(/__/g, "_");
        mon_class.push(classname)
        mon_classname_v2.push(classname_v2)
        mon_class_v2.push(monitors_settings[classname_v2])
    }

    return { mon_class_v2, mon_class, mon_classname_v2 }
}

function fixData(data) {

    //   console.log(config)
    const newData = []
    const mon_name = []
    const mon_name_v2 = []
    const m_s = settings(data);


    data.forEach((d, i) => {
        let mon_class = m_s.mon_class[i];
        let mon_class_v2 = m_s.mon_classname_v2[i];

        if (config.line.indicators.monitors[mon_class]) newData.push(d)
        if (config.line.indicators.monitors[mon_class]) mon_name.push(mon_class)
        if (config.line.indicators.monitors[mon_class]) mon_name_v2.push(mon_class_v2)

    });
    g.monitor_names = mon_name_v2;
    return newData;
}


const createNodes = (svg) => {

    const { data } = svg.datum();

    svg.selectAll('path').remove();
    const newData = fixData(data);
    svg.selectAll("svg > g.indicator").data(newData).enter().call(template, newData)
}

const pos = (svg) => {
    const { x, y, data } = svg.datum();

    const m_s = settings(data);
    div = d3.select('div.tooltip'); //getting the hover ready

    svg.selectAll('path')
        .attr('transform', function(d, i) {

            let deviation = (settingsJson()[g.monitor_names[i]] != null) ? Number(settingsJson()[g.monitor_names[i]].deviation) / 100 : 15 / 100;

            if (d.pos == "High") {
                var newHigh = d.high * (1 + deviation)
                return "translate(" + x(d.date) + "," + y(newHigh) + ") rotate(-180)";
            } else {
                var newLow = d.low * (1 - deviation)
                return "translate(" + x(d.date) + "," + y(newLow) + ")";
            }
        })
}


export default { createNodes, pos }