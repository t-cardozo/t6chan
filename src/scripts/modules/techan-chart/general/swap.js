import {
    set_dim,
    x,
    y,
    x2,
    initalise_indicators
} from '../set_chart_variables'
import c_svg from '../set_chart_svg'
import indicators from '../indicators'
import _brush from './brush'
import hovers from './hover'

function swap(list) {

    config.indicator.selected = [];


    list.forEach((indicator) => config.indicator.selected.push(indicator[0]));

    const dim = set_dim();

    c_svg.indicator_clip_f.remove()
    c_svg.indicator_clip_f = indicators.svg.setIndicatorsClip({ svg: c_svg.indicator_clip_g, dim: dim })

    config.indicator.selected.forEach((indicatorName) => indicators.main.refresh({
        dim: dim,
        indicator: indicatorName,
        inicator_init: initalise_indicators(dim),
        x: x
    }))

    //reset all the indicator clip by index 

    const indicatorList = [...config.indicator.selected, 'brush']
    indicatorList.forEach((indicator, index) => {
        d3.select(`g.${indicator}.indicator-group`).raise()
        d3.select(`g.${indicator} .indicator-plot`).attr("clip-path", "url(#indicatorClip-" + index + ")")
    })
    //update height and y pos **
    c_svg.chart_borders.indicators.selectAll('rect')
        .attr('y', (d) => dim.position.spacing[d] + dim.size.main.padding)
        .attr("height", (d) => dim.border.indicator.height(d))


    c_svg.handles.indicators.selectAll('g.drag-handle.H rect')
        .attr("y", (d) => dim.border.indicator.handlePos(d))

    c_svg.handles.indicators.selectAll('g.drag-handle.V rect')
        .attr("y", (d) => dim.border.indicator.handlePosTop(d))
        .attr("height", (d) => dim.border.indicator.height(d))

    d3.select(`g.pane`).call(_brush.initialiseBrush(dim, x2).brush)
    _brush.resizeBrushPane({ dim: dim, x2: x2 });

    d3.selectAll('g.indicator_label').remove();
    d3.selectAll('g.indicator-group').call(hovers.label.createIndicatorHover)
    hovers.label.labelhover({ labels: c_svg.labels, x: x, y: y, crosshair_e: null, data: c_svg.main_line_holder_g.datum(), svg: { ma_indicator_g: c_svg.ma_indicator_g } })


}

export default { swap }