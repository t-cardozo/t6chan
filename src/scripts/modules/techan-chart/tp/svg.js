import { initialiseCustomLineSVG } from '../../utils'
import fnc from './fnc'

function setTP(svg) {
    if (fnc.showTP()) return initialiseCustomLineSVG({ svg: svg, name: 'tp-line', clip: 'mClip_' })
}

export default { setTP }