const checkOverlay = (type) => config.line.overlay[type].show


function initialiseOverlay(x, y, overlay) {
    if (!checkOverlay(overlay)) return false;

    const overlayObj = {}
    overlayObj.overlay = techan.plot[overlay]()
        .xScale(x)
        .yScale(y)

    if (overlay == 'bollinger') {
        overlayObj.overlayArea = d3.area()
            .x((d) => x(d.date))
            .y0((d) => y(d.lowerBand))
            .y1((d) => y(d.upperBand))
    }

    return overlayObj
}

function createOverlay(svg, overlay) {
    if (!checkOverlay(overlay)) return false;

    svg.append("g")
        .attr("class", "overlay " + overlay)
        .attr("clip-path", "url(#mClip_)")


    if (overlay == 'bollinger') {
        svg.append("g")
            .attr("class", `overlay ${overlay}_area`)
            .attr("clip-path", "url(#mClip_)")
            .append('path')
    }
}


function generateData(data, overlay) {
    if (overlay == 'bollinger') return techan.indicator[overlay]().period(config.line.overlay.bollinger.prop.period).sdMultiplication(config.line.overlay.bollinger.prop.sd)(data);
    if (overlay == 'atrtrailingstop') return techan.indicator[overlay]().period(config.line.overlay.atrtrailingstop.prop.period).multiplier(config.line.overlay.atrtrailingstop.prop.multiplier)(data);
}

function exe(svg) {

    const { data, x, y, overlay } = svg.datum();

    if (!checkOverlay(overlay)) return false;
    const overlayData = generateData(data, overlay);
    svg.select(`g.${overlay}`).datum(overlayData).call(initialiseOverlay(x, y, overlay).overlay)
    if (overlay == 'bollinger') {
        svg.datum(overlayData)
        svg.select(`g.${overlay}_area path`).datum(overlayData).attr("d", initialiseOverlay(x, y, overlay).overlayArea)
    }
}

function refresh(svg, x, y, overlay) {
    if (!checkOverlay(overlay)) return false;
    svg.select(`g.${overlay}`).call(initialiseOverlay(x, y, overlay).overlay.refresh)

    if (overlay == 'bollinger') {
        const data = svg.datum()
        svg.select(`g.${overlay}_area path`).datum(data).attr("d", initialiseOverlay(x, y, overlay).overlayArea)
    }

}






export default {
    initialiseOverlay,
    checkOverlay,
    createOverlay,
    exe,
    refresh
}