import mline from './main-line/index'
import indicator from './indicators/index'
import _brush from './general/brush'

//**** RESOLUTION AND DISPLAY SETTINGS */
export const set_dim = (type) => {


    const display = config.display_settings

    let dim = {
        margin: display.margin,
        width: display.size.width,
        height: display.size.height,
        size: {
            main: config.line.size,
            indicator: config.indicator.size
        },
        position: {},
        border: { main: {}, indicator: {} }
    }

    dim.plot = {
        width: dim.width - dim.margin.left - dim.margin.right,
        height: dim.height - dim.margin.top - dim.margin.bottom
    };

    dim.position.top = dim.size.main.height + dim.size.main.padding;


    //creates a new list of selected indicators then adds 'brush' to the end. 
    let indicatorList = [...config.indicator.selected, 'brush']

    let dI = dim.position,
        dS = dim.size.indicator,
        dB = dim.border

    dI.indicatorTop = [], dI.spacing = [], dI.iScale = [];

    dI.itemByLast = (value) => indicatorList[indicatorList.length - value];

    dI.itemByFirst = (value) => indicatorList[value];

    dI.modifiedList = indicatorList;


    dI.spacing[indicatorList[0]] = dI.top;

    dI.bottom = [];
    let iSTotal = 0;
    indicatorList.forEach((indicatorName, index) => {

        if (dS[indicatorName] == null) {
            config.indicator.size[indicatorName] = { height: 75, padding: 15 }
            dS[indicatorName] = config.indicator.size[indicatorName]
        }
        //dunno why these are needed.. but uncommented.. for now
        dI.bottom[indicatorName] = dI.top + dS[indicatorName].height + dS[indicatorName].padding
        dI.indicatorTop[indicatorName] = d3.scaleLinear().range([dI.top, dI.bottom[indicatorName]])

        let j = index + 1,
            nextIndicatorName = (config.indicator.selected.length == 0) ? indicatorList[index] : indicatorList[j],
            indicatorSize = dS[indicatorName].height + dS[indicatorName].padding,
            //if first 1 then add main chart spacing + spacing else just spacing
            indicatorSpacing = (index == 0) ? dI.top + indicatorSize : indicatorSize
        indicatorSpacing = (config.indicator.selected.length == 0) ? dI.top : indicatorSpacing //temp patch to fix unknown spacing issue with brush
        let isTotalAdd = iSTotal + indicatorSpacing

        //if added to patch the undefined value that gets added because of the index + 1... should be a dodgy fix.
        if (nextIndicatorName != null) {
            //adding 20 for now, testing purposes, might not need it //TODO
            iSTotal = (dI.itemByLast(1) == nextIndicatorName) ? isTotalAdd + dS.brush.padding : isTotalAdd

            dI.spacing[nextIndicatorName] = iSTotal
        }

        dI.iScale[indicatorName] = d3.scaleLinear()
            .range([dI.spacing[indicatorName] + dS[indicatorName].height, dI.spacing[indicatorName] + 4])
    });

    dI.axisheight = (config.indicator.selected.length == 0) ? dim.size.main.height : dI.spacing[dI.itemByLast(1)] - dS[dI.itemByLast(2)].padding - dS[dI.itemByLast(1)].padding;
    dI.brushAxisHeight = dI.spacing[dI.itemByLast(1)] + dS[dI.itemByLast(1)].height

    dB.main.height = dim.size.main.height + dim.margin.top
    dB.main.height = (config.indicator.selected.length == 0) ? dB.main.height + (dim.size.main.padding * 2) : dB.main.height + (dim.size.main.padding / 2)

    dB.dragHandleSize = 8;
    dB.main.handlerPos = dB.main.height - (dB.dragHandleSize / 2)

    dB.indicator.height = (d) => {
        if (dI.itemByLast(1) != d && dI.itemByLast(2) != d) return dS[d].height + dS[d].padding
        if (dI.itemByLast(2) == d) return dS[d].height + dS[d].padding + dS[dI.itemByLast(1)].padding
        if (dI.itemByLast(1) == d) return dS[d].height + dS[d].padding + dim.size.main.padding
    }

    dB.indicator.handlePos = (d) => { //d equals indicator
        if (dI.itemByLast(1) != d && dI.itemByLast(2) != d) return dI.spacing[d] + dim.size.main.padding + dS[d].height + dS[d].padding - (dB.dragHandleSize / 2)
        if (dI.itemByLast(2) == d) return dI.spacing[d] + dim.size.main.padding + dS[d].height + dS[d].padding + dS[dI.itemByLast(1)].padding - (dB.dragHandleSize / 2)
        if (dI.itemByLast(1) == d) return dI.spacing[d] + dim.size.main.padding + dS[d].height + dS[d].padding + dS[dI.itemByLast(1)].padding - (dB.dragHandleSize)
    }

    dB.indicator.handlePosTop = (d) => { //d equals indicator
        if (dI.itemByLast(1) != d && dI.itemByLast(2) != d) return dI.spacing[d] + dim.size.main.padding - (dB.dragHandleSize / 2)
        if (dI.itemByLast(2) == d) return dI.spacing[d] + dim.size.main.padding - (dB.dragHandleSize / 2)
    }
    dim.newHeight = dI.axisheight + dS[dI.itemByLast(1)].height + dS[dI.itemByLast(1)].padding + dim.margin.top + dim.margin.bottom

    return dim
}

//initial set dim object.
export let dim = set_dim();

/*********************** */
export let parseDate = d3.timeParse("%Y-%m-%d"),

    x = techan.scale.financetime()
    .range([0, dim.plot.width]),

    //unmodified X so the value of x(1) doesnt change when domain is added to the x.. D3 can answer why it changes the x(1)
    xU = x.copy(),

    x2 = techan.scale.financetime()
    .range([0, dim.plot.width]),

    y = d3.scaleLinear()
    .range([dim.size.main.height, 0]),

    y_Eps = y.copy(),

    yPercent = y.copy(),

    xAxis = d3.axisBottom()
    .scale(x).ticks(5),

    xAxis2 = d3.axisBottom(x2).ticks(1),

    yAxis = d3.axisRight(y)
    .tickFormat(d3.format('$,.2f')),

    percentAxis = d3.axisLeft(yPercent)
    .tickFormat(d3.format('.0%')),


    plot_type = (name) => {
        let plot = techan.plot[name]()
            .xScale(x)
            .yScale(y)
        return plot
    },

    line_type = () => plot_type(config.line.selectedFix()),

    gridlines = mline.func.initialiseGrid(dim, x, y),

    accessor = line_type().accessor(),

    closeAnnotation = techan.plot.axisannotation()
    .axis(yAxis)
    .orient('right')
    .accessor(accessor)
    .format(d3.format('$,.2f'))
    .translate([x(1), 0]),

    timeAnnotation = mline.func.setAxisAnnotation({
        axis: xAxis,
        orient: 'bottom',
        format: d3.timeFormat('%e %b %Y'),
        width: 75,
        translate: [0, dim.position.axisheight]
    }),

    timeAnnotationTop = techan.plot.axisannotation()
    .axis(xAxis)
    .width(75)
    .format(d3.timeFormat('%e %b %Y'))
    .orient('top'),

    line_type_annotation = techan.plot.axisannotation()
    .axis(yAxis)
    .orient('right')
    //  .accessor(accessor)
    .format(d3.format('$,.2f'))
    .translate([x(1), 0]),


    line_type_percentAnnotation = techan.plot.axisannotation()
    .axis(percentAxis)
    .orient('left'),

    line_type_Crosshair = techan.plot.crosshair()
    .xScale(timeAnnotation.axis().scale())
    .yScale(line_type_annotation.axis().scale())
    .xAnnotation([timeAnnotation, timeAnnotationTop])
    .yAnnotation([line_type_percentAnnotation, line_type_annotation])
    .verticalWireRange([0, dim.position.axisheight]),

    ma_Line = () => (config.ma.selected != '' && config.ma.selected != 'none') ? plot_type(config.ma.selected) : '' //ma._function.ma_line_type(plot_type),

export const initalise_indicators = (dim) => {
    //reinitalise the dim incase new indicators are added or removed.

    let i_v = {
        indicators: {},
        indicatorsAxis: { Left: {}, Right: {} },
        indicatorsAnnotation: { Left: {}, Right: {} },
        indicatorsCrosshair: {}
    };

    config.indicator.selected.forEach((indicatorName) => {

        //initalise indicator
        i_v.indicators[indicatorName] = indicator.main.setIndicator(indicatorName, accessor, x, dim.position.iScale[indicatorName]);
        //lopt through the left right array, and initalise the axis and annotation 
        ['Right', 'Left'].forEach((orient) => {
            i_v.indicatorsAxis[orient][indicatorName] = indicator.main.setIndicatorAxis(orient, dim.position.iScale[indicatorName], config.indicator.prop[indicatorName].format, 3, [xU(1), 0])
            i_v.indicatorsAnnotation[orient][indicatorName] = indicator.main.setIndicatorAnnotation(i_v.indicatorsAxis[orient][indicatorName], {
                orient: orient.toLowerCase(),
                format: config.indicator.prop[indicatorName].format,
                translate: [xU(1), 0]
            })
        });
        //initalise indicator crosshairs.
        let iAnno = (orient) => i_v.indicatorsAnnotation[orient][indicatorName]
        i_v.indicatorsCrosshair[indicatorName] = indicator.main.setIndicatorCrosshair([timeAnnotation, timeAnnotationTop], [iAnno('Left'), iAnno('Right')], dim.position.axisheight)
    });
    return i_v
}


/********** */