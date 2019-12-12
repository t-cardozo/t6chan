import { initialiseCustomLineSVG } from '../../utils'
import fnc from './fnc'

function setEPS(svg) {
    const epsSVG = {}
    fnc.epsArr().forEach((epsName) => {
        let classname = (!epsName.includes('epsrolling')) ? `eps ${epsName}` : epsName
        epsSVG[epsName] = initialiseCustomLineSVG({ svg: svg, name: classname, clip: 'mClip_' });
    })
    return epsSVG;
}

export default { setEPS }