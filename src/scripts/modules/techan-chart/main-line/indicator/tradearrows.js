let div = null;

function check() {
    return config.line.indicators.tradearrow
}


function initialiseTradeArrows(opts) {
    const { x, y } = opts;
    const tradearrow = techan.plot.tradearrow()
        .xScale(x)
        .yScale(y)
        .orient((d) => d.type.startsWith("buy") ? "up" : "down")
        .size(function(d) {


            if (d.type.includes("trading")) return config.line.indicators.tradearrow.trading.size
            if (d.type.includes("investing")) return config.line.indicators.tradearrow.investing.size
            if (d.type.includes("option")) return config.line.indicators.tradearrow.option.size
            if (d.type.includes("income")) return config.line.indicators.tradearrow.income.size
            if (d.type.includes("portfolio")) return config.line.indicators.tradearrow.portfolio.size
        })
        .on("click", tradeEnter)
        .on("mouseenter", tradeHover)
        .on("mouseout", tradeExit)


    return tradearrow;
}

function tradeEnter(d) {
    storeData(d.tradeurl);
    $('#myModal').modal('show');
    if (d.type == 'buy-portfolio' || d.type == 'sell-portfolio') {
        loadCurrentPortfolio(d.date);
    } else {
        $('.modal-title').text(d.hover);
        $('.modal-body').load(d.tradeurl);
    }
}

function tradeHover(d) {

    div.transition()
        .duration(200)
        .style("opacity", .95);

    div.html(d.hover)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
}

const tradeExit = () => div.transition().duration(200).style("opacity", 0);


function loadCurrentPortfolio(asatdate) {
    var id = $('#sel-portfolio option:selected').val();
    var symbol = $('.btn-show-sym').text();
    var portfolio = $('#sel-portfolio option:selected').text();
    var title = symbol + ' - ' + portfolio;
    var newdate = new Date(asatdate);
    var strdate = encodeURI(newdate.getFullYear() + '-' + (newdate.getMonth() + 1) + '-' + newdate.getDate());
    var viewdate = newdate.getDate() + '/' + (newdate.getMonth() + 1) + '/' + newdate.getFullYear();
    var url = 'report/inc_halo_portfolio_data.cfm?q=comment&portfolioid=' + id + '&date=' + strdate;
    $('.modal-title').text(title);
    $('.modal-body').load(url);
    window.setTimeout(function() {
        var subject = $('.comment-title') ? $('.comment-title').val() : 'Untitled';
        $('.modal-title').text(subject + ' - ' + title);
    }, 400);
}


function createTradeArrows(svg) {
    div = d3.select('div.tooltip'); //getting the hover ready
    return svg.append("g")
        .attr("class", "tradearrow")
        .attr("clip-path", "url(#mClip_)")
}

function fixData(svg) {
    let data = svg.datum();
    let newData = []
    data.forEach((trade) => {
        if(trade != null) {
            let trade_type = trade.type.split("-").pop()
            if (check()[trade_type].show) newData = [...newData, trade]   
        } 
    });
    svg.datum(newData)
}

function exe(svg) {
    const { data, x, y } = svg.datum();
    const tradearrow_g = svg.select('g.tradearrow');
    tradearrow_g.select('*').remove();
    tradearrow_g.datum(data).call(fixData).call(initialiseTradeArrows({ x: x, y: y }))
}



export default {
    initialiseTradeArrows,
    createTradeArrows,
    exe
}