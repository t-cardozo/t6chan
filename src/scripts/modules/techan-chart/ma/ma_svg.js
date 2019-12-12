import _f from './ma_functions'

const set_indicator_g = function(selector) {

    if (_f._check_ma_avaliable()) {

        if (!selector.node().hasChildNodes()) {
            // It has at least one
            let ma_indicator = selector.selectAll("svg > g.indicator").data(_f.getMA())
                .enter()
                .append("g")
                .attr("class", function(d, i) {
                    const displayed = (d.show) ? 'line-visible' : 'line-hidden'
                    return displayed + " ma-line-holder-g indicator ma-" + i;
                })
                .attr("clip-path", "url(#mClip_)")

            ma_indicator.append("g").attr('class', 'ma-line-g')

            return ma_indicator;
        } else {
            return selector.selectAll('.ma-line-holder-g').data(_f.getMA())
        }
    }

}
export default {
    set_indicator_g
}