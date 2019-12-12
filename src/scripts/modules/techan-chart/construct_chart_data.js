import { parseDate, accessor } from './set_chart_variables.js'
//retrive data from api, and map the data accordingly and store the


export const composeData = (json) => {


  
   // const response = await fetch(url);
  //  const json = await response.json();

    const main_data = json[0].map((d) => {
        return {
            date: parseDate(d.AsAtDate),
            open: +d.Open,
            high: +d.High,
            low: +d.Low,
            volume: +d.Volume,
            close: +d.Close,
            tp: +d.TP,
            epsm1: +d.EPS_M1,
            epsm2: +d.EPS_M2,
            epsm3: +d.EPS_M3,
            epsm4: +d.EPS_M4,
            epsm5: +d.EPS_M5,
            epsm6: +d.EPS_M6,
            epsm7: +d.EPS_M7,
            epsm8: +d.EPS_M8,
            epsm9: +d.EPS_M9,
            epsm10: +d.EPS_M10,
            epsm11: +d.EPS_M11,
            epsm12: +d.EPS_M12,
            epsm13: +d.EPS_M13,
            epsm14: +d.EPS_M14,
            eps0: +d.EPS_0,
            eps1: +d.EPS_1,
            eps2: +d.EPS_2,
            eps3: +d.EPS_3,
            epsrolling1: +d.EPS_Rolling_1,
            epsrolling2: +d.EPS_Rolling_2,
            tradevalue: +d.TradeValue,
            PE_Avg: +d.PE_Avg,
            PE_Limit: +d.PE_Limit,
            PE_Std_P2: +d.PE_Std_P2,
            EVEBITDA: +d.EVEBITDA,
            EVEBITDA_Avg: +d.EVEBITDA_Avg,
            EVEBITDA_Std_P2: +d.EVEBITDA_Std_P2,
            DIVY: +d.DIVY,
            DIVY_Avg: +d.DIVY_Avg,
            DIVY_Std_P2: +d.DIVY_Std_P2
        };
    }).sort((a, b) => d3.ascending(accessor.d(a), accessor.d(b)));

    const brush_data = json[9].map((d) => {
        return {
            date: parseDate(d.AsAtDate),
            close: +d.Close,
            open: +d.Open,
            high: +d.High,
            low: +d.Low
        }
    }).sort((a, b) => d3.ascending(accessor.d(a), accessor.d(b)));
	
	
	const frequency_data = json[10].map((d) => {
        return {
            date: parseDate(d.AsAtDate),
            close: +d.Close,
            open: +d.Open,
            high: +d.High,
            low: +d.Low,
			frequency: d.Frequency
        }	
	}).filter(d => (d.frequency).toUpperCase() === (config.data.c).toUpperCase())
	.sort((a, b) => d3.ascending(accessor.d(a), accessor.d(b)));

    const companynews_data = json[1].map(function(d) {
        return {
            date: parseDate(d.date),
            cdate: d.cdate,
            event: d.event,
            source: d.source,
            url: d.url,
            low: d.low
        }
    });

    const dividend_data = json[5].map(function(d) {
        return {
            date: parseDate(d.date),
            cdate: d.cdate,
            paydate: d.paydate,
            currency: d.currency,
            divtotal: d.divtotal,
            franking: d.franking,
            low: d.low

        }
    });

    const flash_data = json[6].map(function(d) {
        return {
            date: parseDate(d.date),
            cdate: d.cdate,
            event: d.event,
            source: d.source,
            url: d.url,
            low: d.low
        }
    });

    const sandr_data = json[3].map(function(d) {
        return {
            start: parseDate(d.start),
            type: d.type,
            end: parseDate(d.end),
            value: +d.value,
            unformatedstart: d.unformatedstart,
            unformatedend: d.unformatedend,
        }
    });


    const trade_data = json[4].map(function(d) {

        if (d.type.endsWith("-portfolio")) {
            try {
                return {
                    date: brush_data[d.SymbolIndex - 1].date,
                    type: d.type,
                    tradeurl: 'https://halotechnologies.com.au/',
                    price: +d.TradePrice,
                    hover: (d.type == 'buy-portfolio' ? 'Buy' : 'Sell') + ' ' + d.Quantity + ' shares @ ' + d.TradePrice
                }
            } catch (e) {}
        } else {
            return {
                date: parseDate(d.date),
                type: d.type,
                tradeurl: d.tradeurl,
                price: +d.price,
                hover: d.hover
            }
        }
    });

    const trendline_data = json[7].map(function(d) {

        return {
            id: +d.id,
            extend: +d.extend,
            linetype: d.linetype,
            start: { date: parseDate(d.start.date), value: d.start.value },
            end: { date: parseDate(d.end.date), value: d.end.value },
            start_o: { date: parseDate(d.start_o.date), value: d.start_o.value },
            end_o: { date: parseDate(d.end_o.date), value: d.end_o.value }
        }
    });

    const monitor_data = json[2].map(function(d) {
        return {
            date: parseDate(d.date),
            desc: d.desc,
            pos: d.pos,
            rgba: d.rgba,
            low: d.low,
            high: d.high
        }
    });

    const notes_data = json[11];

    const date_array = brush_data.map(function(d) {
        return moment(d.date).format("DD.MMMM.YYYY");
    })





    //console.log(json);
    return {
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
    }



}