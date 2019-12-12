import { set_dim } from '../set_chart_variables'
import resize from './resize'
import { debounce } from '../../utils'

function resizeHandleEvent(selection) {

    selection.call(
        d3.drag()
        .on('start', resizeStart)
        .on('end', resizeEnd)
        .on('drag', debounce(resizeDrag, 250)) //change to 250 or 100 later
    )
}

var tempIndicatorHeight;

function resizeStart(d) {

    const dim = set_dim();
    if (d !== 'ohlc' && dim.position.itemByFirst(0) == d) tempIndicatorHeight = (tempIndicatorHeight == null) ? config.indicator.size[d].height : tempIndicatorHeight
}

function resizeEnd(d) {


    setTimeout(function() {
        $('#ohlc_height').val(config.line.size.height)

        const indicators_height = {}
        for (let indicator in config.indicator.size) {
            let value = config.indicator.size[indicator].height
            indicator = (indicator == 'closebrush') ? 'brush' : indicator;
            indicators_height[indicator] = value
        }
    }, 300);

}


function resizeDrag(d) {

    const dim = set_dim();
    let yhandle = d3.mouse(this.parentNode)[1];
    const dP = dim.position,
        handleSize = dim.border.dragHandleSize

    let handlePos = yhandle - (handleSize / 2) //added - 5 because the handle was a bit higher than mouse..


    if (d == 'ohlc') {
        yhandle = (config.indicator.selected.length == 0) ? yhandle - dim.size.main.padding - (handleSize) : yhandle //when so indicator selected add main chart padding and drag handle size to get exact height

        const main_line_height = yhandle - dim.margin.top - dim.size.main.padding + handleSize; //to get to exact height need to remove padding margin, and the handle height..
        config.line.size.height = main_line_height; // (main_line_height >= 200) ? main_line_height : 200;

        d3.select(this).attr("y", handlePos);

    }
    //********/
    if (d !== 'ohlc') { //meaning just indicaotrs

        const mainHeight = dim.size.main.height + dim.size.main.padding - dim.margin.top - (handleSize)

        const indicatorH = tempIndicatorHeight + dim.size.indicator[d].padding - (handleSize / 2)

        const spacingValue = dP.spacing[d];
        const i_top = spacingValue + handleSize + dim.size.indicator[d].padding;
        const firstItemPadding = (config.indicator.selected.length == 1) ? 25 : 0;
        if (dP.itemByFirst(0) == d) yhandle = yhandle - (i_top - mainHeight) - mainHeight - firstItemPadding;
        else if (dP.itemByLast(1) != d && dP.itemByLast(2) != d) yhandle = yhandle - mainHeight - (i_top - mainHeight) - (handleSize / 2)
        else if (dP.itemByLast(2) == d) yhandle = yhandle - mainHeight - (i_top - mainHeight) - (handleSize / 2) - dim.size.indicator[dP.itemByLast(1)].padding
        else if (dP.itemByLast(1) == d) yhandle = yhandle - mainHeight - (i_top - mainHeight) - (handleSize / 2) - dim.size.indicator[dP.itemByLast(1)].padding

        config.indicator.size[d].height = (yhandle >= 70) ? yhandle : 70;
    }


    resize.resizeChart();
}

export default {
    resizeHandleEvent
}