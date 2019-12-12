import { id, class_ } from './utils'
import e_func from './event_funcs'

function events(jsonData) {

    const { main_data, brush_data } = jsonData;

    //resize chart when brower width is changed.
    let resizeTimeout;


    d3.select(window).on("resize", () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(e_func.resizeChart.bind(null, main_data), 500)
    });

}

export default events;