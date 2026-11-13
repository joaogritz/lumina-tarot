// Card, spread and suit texts in this language, loaded only when the page uses it.
import major from './major.js';
import minorA from './minorA.js';
import minorB from './minorB.js';
import other from './other.js';

export default { tarot: { ...major, ...minorA, ...minorB }, ...other };
