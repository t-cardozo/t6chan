let div = null;
let date_array = null;
let g = {};

function initialiseTrendline(opts) {
    const { x, y } = opts;

    return techan.plot.trendline()
        .xScale(x)
        .yScale(y)
        .on("dragend", trend_drag_end)
        .on("dragstart", trend_drag)
        .on("drag", trend_drag)

}


function createTrendLine(svg, opts) {

    if (opts != null && opts.action != 'create-new-line') {
        var { data, date_data } = svg.datum();
        date_array = date_data;
    } else {
        var data = (opts != null) ? opts.data : []
    }


    div = d3.select('div.tooltip'); //getting the hover ready


    if (opts != null && opts.action != 'create-new-line') d3.selectAll(`g.trendlines`).remove();


    for (let i in data) {
        let lineType = (data[i].linetype == 'S') ? 'support' : 'resistance'

        if (svg.select(`g.trendlines#${lineType + '-' + data[i].id}`).empty()) {

            svg.append("g")
                .attr("class", "trendlines " + lineType)
                .attr("id", lineType + '-' + data[i].id)
        }

        svg.select(`g.trendlines#${lineType + '-' + data[i].id}`).datum([data[i]])
    }
}

function exe(svg) {
    const { x, y, set_dim, main_data } = svg.datum();
    const trendline = initialiseTrendline({ x: x, y: y });

    g = { svg: svg, trendline: trendline, x: x, y: y, data: main_data, set_dim: set_dim }
    svg.selectAll("g.trendlines")
        .on("mouseenter", trend_hover)
        .on("mouseout", trend_exit)
        .on("contextmenu", trend_menu)
        .call(trendline).call(trendline.drag);


    chart_api['create-trendline'] = drawLinePlot;
}


function getPlot_Point(selection, axis) {

    const { x, y, data } = g;
    if (axis == 'x') {
        var i = x.invertToIndex(d3.mouse(selection)[0]);
    } else {
        var i = y.invert(d3.mouse(selection)[1]);
    }
    var d = (axis == 'x') ? data[i] : i;
    return d;

}


function drawLinePlot(svg, set_dim) {

    const dim = g.set_dim();
    //   var data = svg.select("g.candlestick").datum();

    var xy0, xy1, path, keep = false

    const { x, y, data } = g;

    var draw_rect = d3.select('g._main_chart_g').append("rect")
        .attr("id", "line_drawing_rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", dim.plot.width)
        .attr("height", dim.size.main.height)
        .style("fill", "none")
        .style('cursor', 'url("images/crosshair2.png") 9 9, auto')
        .style("pointer-events", "all")
        .on('mousedown', function(d) {

            if (!keep) {

                var start_Plot_x = getPlot_Point(this, 'x');
                var start_Plot_y = getPlot_Point(this, 'y');

                keep = true;

                var threshold_percent = 1;
                var high_threshold = start_Plot_x.high * (threshold_percent / 100);
                var low_threshold = start_Plot_x.low * (threshold_percent / 100);


                var is_hightheshold = (start_Plot_y <= (start_Plot_x.high + high_threshold)) && (start_Plot_y >= (start_Plot_x.high - high_threshold));
                var is_lowtheshold = (start_Plot_y <= (start_Plot_x.low + low_threshold)) && (start_Plot_y >= (start_Plot_x.low - low_threshold));

                var lineType = (is_hightheshold) ? 'R' : 'S';

                //var lineType = (start_Plot_x.high < start_Plot_y) ? 'S' : 'R'

                xy0 = [{
                    date: start_Plot_x.date,
                    price: start_Plot_y,
                    type: lineType
                }];

                var guide_Line_Path = 'M ' + x(xy0[0].date) + ' ' + y(xy0[0].price)

                svg.append('path')
                    .attr('class', 'draw-guide-line')
                    .attr('d', guide_Line_Path)
                    .style("stroke", "grey")
                    .style("stroke-dasharray", ("3, 3"))
                    .style("stroke-width", "1px")

            }
        })

        .on('mouseup', function(d) {

            keep = false;
            svg.selectAll('.draw-guide-line').remove();
            draw_rect.remove();

            var symbol = $('table#mstrTable tbody').find('.symbolRow.info').attr('id');

            var myURL = "report/dsp_research_summary_chart.cfm?q=trend_modal_save";

            $.ajax({
                url: myURL,

                type: "POST",
                data: {
                    "symbol": symbol,
                    "linetype": xy0[0].type,
                    "extendable": 0,
                    "start_date": moment(xy0[0].date).format('YYYY-MM-DD'),
                    "end_date": moment(xy1[0].date).format('YYYY-MM-DD'),
                    "start_value": Number(xy0[0].price.toFixed(3)),
                    "end_value": Number(xy1[0].price.toFixed(3))
                },
                dataType: "text",
                success: function(msg) {


                    const trendline_data = xy0.map(function(d, i) {
                        let e = xy1[i]

                        return {
                            id: Number($.trim(msg)),
                            extend: 0,
                            linetype: d.type,
                            start: { date: d.date, value: Number(d.price.toFixed(3)) },
                            end: { date: e.date, value: Number(e.price.toFixed(3)) },
                        }
                    });

                    createTrendLine(d3.select('g.trendlines_g'), { action: 'create-new-line', data: trendline_data })

                    d3.select("g.trendlines:last-child")
                        .on("mouseenter", trend_hover)
                        .on("mouseout", trend_exit)
                        .on("contextmenu", trend_menu)
                        .call(g.trendline)
                        .call(g.trendline.drag);


                    $("#myModal").removeData("lineData");
                    $('#myModal').data("lineData", { d: trendline_data, date_array: date_array });

                    trend_menu();
                }
            })
        })

        .on('mousemove', function() {

            if (keep) {
                var start_Plot_x = getPlot_Point(this, 'x');
                var start_Plot_y = getPlot_Point(this, 'y');

                xy1 = [{
                    date: start_Plot_x.date,
                    price: start_Plot_y
                }];
                var guide_Line_Path = 'M ' + x(xy0[0].date) + ' ' + y(xy0[0].price) + ' L ' + x(xy1[0].date) +
                    ' ' + y(xy1[0].price);

                svg.select('.draw-guide-line').attr('d', guide_Line_Path);
            }

        })

}

function trend_hover(d) {

    var data = d[0]

    var linetype = (data.linetype == 'S') ? 'Support' : 'Resistance';
    div.transition().duration(200).style("opacity", .95);

    div.html(linetype + ": [" + moment(data.start.date).format('YYYY-MM-DD') + ' , ' + moment(data.end.date).format('YYYY-MM-DD') + "] , [" + (data.start.value).toFixed(3) + ' , ' + (data.end.value).toFixed(3) + ']')
        .style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");

    $("#myModal").removeData("lineData");
    $('#myModal').data("lineData", { d, date_array });

}


const trend_exit = () => div.transition().duration(200).style("opacity", 0);

function trend_menu() {

    $('#myModal .modal-content').removeClass('modal-lg');
    $('#myModal .modal-dialog').addClass('modal-sm');

    $('#myModal').modal('show');
    $('.modal-title').text("Update Line");
    $('.modal-body').empty();

    $('.modal-body').load('report/dsp_research_summary_chart.cfm?q=trend_modal_dsp&i=u', () => $(".custom-menu").hide());
}


function trend_drag_end(d) {


    const lineID = $(this).closest('g.trendlines').attr('id');
    const lineID_id = $.trim(lineID.split('-')[1])


    const endDate = moment(d.end.date).format('YYYY-MM-DD');
    const brushendDate = moment(date_array[date_array.length - 1]).format('YYYY-MM-DD')

    if (endDate == brushendDate) d.end.date = date_array[date_array.length - 2];


    var myURL = "report/dsp_research_summary_chart.cfm?q=trend_modal_update_pos";

    $.ajax({
        url: myURL,
        type: "POST",
        data: {
            "trend_id": lineID_id,
            "start_date": moment(d.start.date).format('YYYY-MM-DD'),
            "end_date": moment(d.end.date).format('YYYY-MM-DD'),
            "start_value": (d.start.value).toFixed(3),
            "end_value": (d.end.value).toFixed(3)
        },
        dataType: "text",
        success: function(msg) {
            trendline_run_update();
        }
    })


    function trendline_run_update() {
        if (d.extend == 1) {
            d.end.date = date_array[date_array.length - 1];
            var myURL = "report/dsp_research_summary_chart.cfm?q=trend_modal_endpoint";

            $.ajax({
                url: myURL,
                type: "POST",
                data: {
                    "trend_id": lineID_id,
                    "start_date": moment(d.start.date).format('YYYY-MM-DD'),
                    "end_date": moment(d.end.date).format('YYYY-MM-DD'),
                    "symbol": getSymbol()
                },
                success: function(endPoint) {

                    d.end.value = Number(Number($.trim(endPoint)).toFixed(3));
                    d.extend = 1;

                    g.svg.select("g.trendlines#" + lineID).datum([d])
                        .on("mouseenter", trend_hover)
                        .on("mouseout", trend_exit)
                        .on("contextmenu", trend_menu)
                        .call(g.trendline.refresh)
                        .call(g.trendline.drag);
                }
            })

        } else {
            d.extend = 0;
            g.svg.select("g.trendlines#" + lineID).datum([d])
                .on("mouseenter", trend_hover)
                .on("mouseout", trend_exit)
                .on("contextmenu", trend_menu)
                .call(g.trendline.refresh)
                .call(g.trendline.drag);
        }

    }

}

const trend_drag = () => div.transition().duration(0).style("opacity", 0);






///************** LISENTERS */


function updateTrendLine() {
    var radioValue = $('input[name=lineType]:checked', '.lineTypeRadio').val();
    var checkValue = $('#selectextendLine').is(":checked")

    var radio_line_type = (radioValue == 'S') ? 'support' : 'resistance'
    var extendableLine = (checkValue) ? 1 : 0;
    //update line;

    //if(lineType == 's')
    $('#' + line_type + '-' + line_id).removeClass('support').removeClass('resistance').addClass(radio_line_type)

    $('#' + line_type + '-' + line_id).attr('id', radio_line_type + '-' + line_id)


    var myURL = "report/dsp_research_summary_chart.cfm?q=trend_modal_update_line";
    $.ajax({
        url: myURL,

        type: "POST",
        data: {
            "trend_id": $.trim(line_id),
            "line_type": radioValue,
            "extendable": extendableLine

        },

        success: function() {
            executeTrendLine();
        }
    })
    var parseDate = d3.timeParse("%Y-%m-%d")

    function executeTrendLine() {

        var trendline_data = line_data[0];

        trendline_data.linetype = (radio_line_type == 'support') ? 'S' : 'R';
        trendline_data.start.date = parseDate(moment($('.start-date.tradedates').val()).format('YYYY-MM-DD'))
        trendline_data.end.date = parseDate(moment($('.end-date.tradedates').val()).format('YYYY-MM-DD'))
        trendline_data.start.value = Number($('.start-date.value').val());
        trendline_data.end.value = Number($('.end-date.value').val());


        if (extendableLine == 1) {


            var endDate = moment(trendline_data.end.date).format('YYYY-MM-DD');
            var brushendDate = moment(date_array[date_array.length - 1].date).format('YYYY-MM-DD')

            if (endDate == brushendDate) {
                trendline_data.end.date = date_array[date_array.length - 2].date;
            }





        }
        var myURL = "report/dsp_research_summary_chart.cfm?q=trend_modal_update_pos";

        $.ajax({
            url: myURL,

            type: "POST",
            data: {
                "trend_id": $.trim(line_id),
                "start_date": moment(trendline_data.start.date).format('YYYY-MM-DD'),
                "end_date": moment(trendline_data.end.date).format('YYYY-MM-DD'),
                "start_value": (trendline_data.start.value).toFixed(3),
                "end_value": (trendline_data.end.value).toFixed(3)

            },
            dataType: "text",
            success: function(msg) {
                update_trendline();
            }
        })





        function update_trendline() {
            if (extendableLine === 1) {

                trendline_data.end.date = date_array[date_array.length - 1].date;
                var myURL = "report/dsp_research_summary_chart.cfm?q=trend_modal_endpoint";

                $.ajax({
                    url: myURL,
                    type: "POST",
                    data: {
                        "trend_id": $.trim(line_id),
                        "start_date": moment(trendline_data.start.date).format('YYYY-MM-DD'),
                        "end_date": moment(trendline_data.end.date).format('YYYY-MM-DD'),
                        "symbol": getSymbol()
                    },
                    success: function(endPoint) {

                        trendline_data.end.value = Number($.trim(endPoint));
                        trendline_data.extend = 1;

                        d3.select("g.trendlines" + '#' + radio_line_type + '-' + line_id).datum([trendline_data])
                            .call(g.trendline.refresh)
                            .call(g.trendline.drag);
                    }
                })



            } else {
                trendline_data.extend = 0;

                d3.select("g.trendlines" + '#' + radio_line_type + '-' + line_id).datum([trendline_data]).call(g.trendline.refresh).call(g.trendline);
            }

        }

    }
    //update to the latest date!
    $('#myModal').modal('hide');
}


export default { createTrendLine, updateTrendLine, exe }