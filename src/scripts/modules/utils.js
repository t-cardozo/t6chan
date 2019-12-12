export const id = id => document.getElementById(id);
export const class_ = class_ => document.getElementsByClassName(class_);

export function removeArrayElement(array, element) {
    const index = array.indexOf(element);
    array.splice(index, 1);
}

export function initialiseCustomLine(opts) {
    const { date, value, x, y } = opts;
    return d3.line()
        .x((d) => x(d[date]))
        .y((d) => y(d[value]))
        .defined((d) => d[value]);
}

export function initialiseCustomLineSVG(opts) {
    const { svg, name, clip } = opts;
    return svg.append("g")
        .attr("class", name)
        .append('path')
        .attr("clip-path", `url(#${clip})`)
}

export function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this;
        var args = arguments;
        var evt = d3.event;

        var later = function() {
            timeout = null;
            if (!immediate) {
                var tmpEvent = d3.event;
                d3.event = evt;
                func.apply(context, args);
                d3.event = tmpEvent;
            }
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            var tmpEvent = d3.event;
            d3.event = evt;
            func.apply(context, args);
            d3.event = tmpEvent;
        }

    };
}

export const createDomain = (arr) => [d3.min(arr), d3.max(arr)]
export const dbFormatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, "-")
export const jsFormatDate = (str) => new Date(str)