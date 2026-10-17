/** Hold a gate until the 1-minute load average is under the cap, and log it. */
import os from 'node:os';

const CAP = 4;

export function loadTriple() {
  return os.loadavg();
}

export function logLoad(label) {
  const [one, five, fifteen] = loadTriple();
  console.log(`LOAD ${label} ${one.toFixed(2)} ${five.toFixed(2)} ${fifteen.toFixed(2)}`);
  return one;
}

export async function waitForLoad(label) {
  let one = loadTriple()[0];
  if (one >= CAP) console.log(`LOAD ${label} waiting ${one.toFixed(2)} >= ${CAP}`);
  while (one >= CAP) {
    await new Promise((r) => setTimeout(r, 5000));
    one = loadTriple()[0];
  }
  return logLoad(`${label} start`);
}
