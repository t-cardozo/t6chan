import indicators from '../../indicators';
import { set_dim } from '../../set_chart_variables'
let g = {}

function template(svg, list) {

    return svg.selectAll("g.indicators").data(list).enter()
        .append("circle")
        .style("opacity", "0")
        .attr("class", function(d) { return d + ' line-hover-circle'; })
        .style("fill", "#fff")
        .style("cursor", "crosshair")
        .style("stroke", "steelblue")
        .attr("r", 2)
        .on("mouseover", showLineHover)
        .on("mouseout", hideLineHover)
}

function createHovers(svg, ma) {
    svg.selectAll('*').remove();
    let hovers = [];
    if (config.tp) hovers.push('tp');
    if (config.eps.selected().includes('eps')) {
        for (let i = 0; i < 4; i++) hovers = [...hovers, 'eps' + i]
        for (let i = 1; i < 15; i++) hovers = [...hovers, 'epsm' + i]
    }
    if (config.eps.selected().includes('epsrolling1')) hovers = [...hovers, 'epsrolling1']
    if (config.eps.selected().includes('epsrolling2')) hovers = [...hovers, 'epsrolling2']

    if (config.ma.selected == 'ema' || config.ma.selected == 'sma') {
        ma.each((d, i) => hovers = (config.ma.display()[i].show) ? [...hovers, 'ma' + i] : [...hovers])
    }


    config.indicator.selected.forEach(indicator => {


        switch (indicator) {
            case 'atr':
                hovers.push(`indicator-${indicator}-value`)
                break;
            case 'williams':
                hovers.push(`indicator-${indicator}-williams`)
                break;
            case 'macd':
                hovers.push(`indicator-${indicator}-macd`)
                hovers.push(`indicator-${indicator}-difference`)
                hovers.push(`indicator-${indicator}-signal`)
                break;
            case 'rsi':
                hovers.push(`indicator-${indicator}-rsi`)
                break;
            case 'adx':
                hovers.push(`indicator-${indicator}-adx`)
                hovers.push(`indicator-${indicator}-minusDi`)
                hovers.push(`indicator-${indicator}-plusDi`)
                break;
            case 'aroon':
                hovers.push(`indicator-${indicator}-oscillator`)
                hovers.push(`indicator-${indicator}-up`)
                hovers.push(`indicator-${indicator}-down`)
                break;
            case 'stochastic':
                hovers.push(`indicator-${indicator}-stochasticD`)
                hovers.push(`indicator-${indicator}-stochasticK`)
                break;
            case 'pe_fy1':
                hovers.push(`indicator-${indicator}-PE_Limit`)
                break;
            case 'yield':
                hovers.push(`indicator-${indicator}-DIVY`)
                break;
            case 'evebitda':
                hovers.push(`indicator-${indicator}-EVEBITDA`)
                break;


        }

    });

    g.ma = ma;
    g.hoverArray = hovers;

    if (hovers.length) svg.call(template, hovers);
}

function showLineHover(d) {
    d3.select('div.tooltip').transition().duration(200).style("opacity", .95)
    d3.select('div.tooltip')
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px")
        .html(hoverText(d))
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


function hoverText(type) {
    switch (type) {
        case 'tp':
            return "Target Price";
        case 'eps0':
            return "EPS (H1)";
        case 'epsm1':
            return "EPS (H2)";
        case 'epsm2':
            return "EPS (H3)";
        case 'epsm3':
            return "EPS (H4)";
        case 'epsm4':
            return "EPS (H5)";
        case 'epsm5':
            return "EPS (H6)";
        case 'epsm6':
            return "EPS (H7)";
        case 'epsm7':
            return "EPS (H8)";
        case 'epsm8':
            return "EPS (H9)";
        case 'epsm9':
            return "EPS (H10)";
        case 'epsm10':
            return "EPS (H11)";
        case 'epsm11':
            return "EPS (H12)";
        case 'epsm12':
            return "EPS (H13)";
        case 'epsm13':
            return "EPS (H14)";
        case 'epsm14':
            return "EPS (H15)";
        case 'eps1':
            return "EPS (FY1)";
        case 'eps2':
            return "EPS (FY2)";
        case 'eps3':
            return "EPS (FY3)";
        case 'epsrolling1':
            return "Rolling FY1";
        case 'epsrolling2':
            return "Rolling FY2";
        case 'ma0':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[0].param})`
        case 'ma1':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[1].param})`
        case 'ma2':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[2].param})`
        case 'ma3':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[3].param})`
        case 'ma4':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[4].param})`
        case 'ma5':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[5].param})`
        case 'ma6':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[6].param})`
        case 'ma7':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[7].param})`
        case 'ma8':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[8].param})`
        case 'ma9':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[9].param})`
        case 'ma10':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[10].param})`
        case 'ma11':
            return `MA (${config.ma.selected.toUpperCase()}, ${config.ma.display()[11].param})`
        case 'indicator-atr-value':
            return "ATR";
        case 'indicator-williams-williams':
            return "Williams R%";
        case 'indicator-macd-macd':
            return "MACD";
        case 'indicator-macd-difference':
            return "Difference";
        case 'indicator-macd-signal':
            return "Signal";
        case 'indicator-rsi-rsi':
            return "RSI";
        case 'indicator-adx-adx':
            return "ADX";
        case 'indicator-adx-minusDi':
            return "-DMI";
        case 'indicator-adx-plusDi':
            return "+DMI";
        case 'indicator-aroon-oscillator':
            return "Oscillator";
        case 'indicator-aroon-up':
            return "Up";
        case 'indicator-aroon-down':
            return "Down";
        case 'indicator-stochastic-stochasticD':
            return "%D";
        case 'indicator-stochastic-stochasticK':
            return "%K";
        case 'indicator-pe_fy1-PE_Limit':
            return "PE FY1";
        case 'indicator-yield-DIVY':
            return "Yield";
        case 'indicator-evebitda-EVEBITDA':
            return "EV/EBITDA FY1";
    }
}

function hideLineHover() {
    d3.select('div.tooltip').transition()
        .duration(200)
        .style("opacity", 0);
}

var debounce_linehover

function lineHover(opts) {
if(debounce_linehover != null) clearTimeout(debounce_linehover);
    const { data, x, yMain, y2, crosshair_e, svg } = opts;

    const index = x.invertToIndex(d3.mouse(crosshair_e)[0])
    const d = data.main_data[index];
    const dataPoint = x.invert(d3.mouse(crosshair_e)[0]);
    const bisectDate = d3.bisector((o) => o.date).left;

	
	debounce_linehover = window.setTimeout(function() {
    const dim = set_dim();

    g.hoverArray.forEach(hoverName => {
        let y = (hoverName.includes('eps')) ? y2 : yMain
        changeCirclePos(svg, d, hoverName, x, y, dataPoint, bisectDate, dim)
    });
	}, 100);

}

function changeCirclePos(svg, d, plot, x, y, dataPoint, bisectDate, dim) {

    if (d == null) return false;

    let value = 0
    if (!plot.startsWith('ma')) {
        value = (!isNaN(y(d[plot]))) ? y(d[plot]) : 0

        //** INDICATOR **/
        if (plot.includes('indicator-')) {

            const indicator_g = d3.selectAll('g.indicator-group').selectAll('g.indicator .indicator-plot');

            const indicator = plot.split("-")[1]
            const indicator_vName = plot.split("-")[2]

            const i_PinPoint = {};
            const i_Data = {};
            const indicator_array = config.indicator.selected;
            let count = 0;
            indicator_g.each((d) => {
                if (indicator_array[count] != null) i_Data[indicator_array[count]] = d
                if (indicator_array[count] != null) i_PinPoint[indicator_array[count]] = pinPointData(d, dataPoint, bisectDate)
                count++;
            });
            indicators.main.domain({ data: i_Data[indicator], dim: dim, indicator: indicator, x: x }) //get the domain
            let d_i = i_PinPoint[indicator],
                iScale = dim.position.iScale[indicator];
            value = (!isNaN(iScale(d_i[indicator_vName]))) ? iScale(d_i[indicator_vName]) : 9999999999999999999 //set indicator posistion over here. \

        }

    } else {

        const maData = []
        g.ma.each(function(d, i) {
            maData[i] = d3.select(this).selectAll('.ma-line-g').datum()
        })
        const maCount = plot.replace(/\D/g, '') //removes all letters only keeps numbers.
        if (config.ma.display()[maCount].show) {
            let m = pinPointData(maData[maCount], dataPoint, bisectDate)


            value = (!isNaN(y(m.value))) ? y(m.value) : 0
        }
    }

    svg.select("circle." + plot + '.line-hover-circle').attr('transform', "translate(" + x(d.date) + "," + value + ")")
}
export default { createHovers, lineHover }