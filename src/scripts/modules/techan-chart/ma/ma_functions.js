function _check_ma_avaliable() {
    const name = ((config || {}).ma || {}).selected;
    return (name != '' && name != 'none')
}
const getSelectedMA = () => config.ma.selected;
const getMA = () => config.ma.display()


//generate reqiured data to render values
const _generate_MA_data = (type, period, data) => techan.indicator[type]().period(period)(data)

function set_ma_data(selector, svgLines) {

    const { data } = selector.datum()
    if (_check_ma_avaliable()) {
        svgLines.each(function(d, i) {
            let maData = _generate_MA_data(getSelectedMA(), d.param, data);

            d3.select(this).select("g").datum(maData)

                if (d.param < 20){ 
                    d3.select(this).classed("blue", false).classed("green", false).classed("red", true);
                } else if (d.param < 90) { 
                    d3.select(this).classed("blue", true).classed("green", false).classed("red", false);
                } else {
                    d3.select(this).classed("blue", false).classed("green", true).classed("red", false);
                }		
        })
    }
}

function execute_ma(selector, ma_func) {
    if (_check_ma_avaliable()) {
        d3.selectAll('.ma-line-g').call(ma_func)
    }
}




const ma_export_functions = {
    _check_ma_avaliable,
    getSelectedMA,
    getMA,
    set_ma_data,
    execute_ma
}

export default ma_export_functions;