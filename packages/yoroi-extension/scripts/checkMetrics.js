import child_process from 'child_process';
import { Ampli } from '../ampli/index';

const EXCLUDE = [
  'isInitializedAndEnabled',
  'load',
  'identify',
  'track',
];

const eventNames = Object.keys(Ampli.prototype).filter(name => !EXCLUDE.includes(name))

const regExpStr = `ampli\\.(${eventNames.join('|')})\\(`;

const grepOutput = child_process.execSync(`grep -h -o -r --include='*.js' -E '${regExpStr}' app chrome | sort | uniq`).toString('utf8');

const seenEventNames =
  grepOutput
    .trim()
    .split('\n')
    .map(line => line.match(/^ampli\.(.+)\(/)[1])
const seenEventNameSet =  new Set(seenEventNames);

const unseenEventNames = eventNames.filter(name => !seenEventNameSet.has(name));

console.log('Number of defined events:', eventNames.length);

console.log('---\nImplemented events %s:\n---\n%s', seenEventNames.length, seenEventNames.join('\n'));

console.log('---\nUnimplemented events %s:\n---\n%s', unseenEventNames.length, unseenEventNames.join('\n'));


