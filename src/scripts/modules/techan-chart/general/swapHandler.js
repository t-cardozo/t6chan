import swapI from './swap'
import { debounce } from '../../utils'

function swapHandleEvent(selection, list, set_dim) {

    selection.call(
        d3.drag()
        .on('start', function(d) { swapStart(this, fixList(list), d, set_dim) })
        .on('end', function(d) { swapEnd(this, list, d, set_dim) })
        .on('drag', function(d) { swapDrag(this, fixList(list), d, set_dim) }))
}

let tempList = [];
let iUpdatable = {}
let indicatorCheck = ''

function swapStart(selector, list, selected, set_dim) {
    list.forEach((indicator, index) => {
        iUpdatable[indicator[0]] = true;
    });


}

const swapEnd = () => $('#chart_order').val(config.indicator.selected.toString())


function swapDrag(selector, h, selected, set_dim) {

    const dim = set_dim();
    const list = fixList(dim.position.modifiedList).slice(0, -1);
    let yhandle = d3.mouse(selector.parentNode)[1];

    const iSpacing = dim.position.spacing
    const iList = list
    iList.forEach((indicator, index) => {

        const iName = indicator[0]
        const spacingValue = iSpacing[iName];
        const i_top = spacingValue + dim.border.dragHandleSize + dim.size.indicator[iName].padding;
        const i_bottom = ((dim.border.indicator.handlePos([iName])))
        const i_middle = (i_top + i_bottom) / 2

        if (yhandle >= i_top && yhandle <= i_bottom) {

            if (yhandle.toFixed(0) >= (i_middle.toFixed(0) - 20) && yhandle.toFixed(0) <= (i_middle.toFixed(0) + 20)) {

                iUpdatable[iName] = (indicatorCheck == iName) ? false : true;
                tempList = iList

                if (iUpdatable[iName]) {
                    const check = [];
                    tempList.map((d) => check.push(d[0]));
                    swapArrValues(tempList, check.indexOf(selected), check.indexOf(tempList[index][0]))
                    swapI.swap(tempList)
                }

                iUpdatable[iName] = false;
                indicatorCheck = iName;
            }
        }
    });

}

function fixList(list) {
    let arr = [];
    list.forEach((value, index) => {
        arr.push([value, index])
    });
    return arr
}

function swapArrValues(arr, x, y) {
    var b = arr[x];
    arr[x] = arr[y];
    arr[y] = b;
    return arr;
}

export default {
    swapHandleEvent
}