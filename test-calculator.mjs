import assert from 'node:assert/strict';
import { overtime } from './calculator.mjs';
let count = 0;
const input = { basis: 'hourly', wage: 50000, hours: 2, normalHours: 208, day: 'weekday', night: false, daytimeOvertime: false };
const check = (changes, expected) => { const r = overtime({ ...input, ...changes }); assert.ok(Math.abs(r.total - expected) < .00001, JSON.stringify({ changes, r, expected })); count++; };
check({}, 150000); check({ day: 'rest' }, 200000); check({ day: 'holiday' }, 300000);
check({ night: true }, 200000); check({ night: true, daytimeOvertime: true }, 210000);
check({ night: true, day: 'rest' }, 270000); check({ night: true, day: 'holiday' }, 390000);
check({ basis: 'monthly', wage: 10400000 }, 150000);
check({ basis: 'monthly', wage: 10000000, normalHours: 200, hours: .5 }, 37500);
check({ hours: 0 }, 0); check({ hours: 1.25 }, 93750); check({ hours: 744 }, 55800000);
check({ day: 'rest', daytimeOvertime: true, night: true }, 270000);
check({ daytimeOvertime: true }, 150000);
for (const changes of [{ wage: 0 }, { wage: -1 }, { wage: NaN }, { wage: Infinity }, { wage: 1e13 }, { hours: -1 }, { hours: 745 }, { hours: NaN }, { basis: 'monthly', normalHours: 0 }, { basis: 'monthly', normalHours: 745 }, { basis: 'monthly', normalHours: NaN }, { day: 'unknown' }, { basis: 'unknown' }]) { assert.throws(() => overtime({ ...input, ...changes })); count++; }
for (const day of ['weekday','rest','holiday']) for (const night of [true,false]) { const r = overtime({...input,day,night,hours:3.75,wage:123456.78}); assert.ok(Math.abs(r.total - (r.dayAmount + r.nightAmount + r.extraAmount)) < 1e-8); count++; }
console.log(`${count} calculator checks passed.`);
