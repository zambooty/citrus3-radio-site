import assert from 'node:assert/strict';
import test from 'node:test';
import { formatNewsDate } from '../src/lib/format.ts';
import { showShareText } from '../src/lib/shareText.ts';

test('news dates stay on the calendar day they were written', () => {
    const label = formatNewsDate('2026-11-08');
    assert.match(label, /2026/);
    assert.match(label, /8/);
    assert.equal(label.includes('7'), false);
});

test('share captions include the air time and a single period after the host', () => {
    const text = showShareText({
        title: 'Morning Coffee',
        host: 'Sarah J.',
        airTime: 'Weekdays at 8:00 AM',
    });
    assert.equal(text.includes('Sarah J..'), false);
    assert.match(text, /Weekdays at 8:00 AM with Sarah J\./);
    assert.match(text, /Come listen with us/);
});
