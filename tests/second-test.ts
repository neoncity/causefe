import { expect } from 'chai'
import 'mocha'

import { addFoo } from '../src/server/second';

describe('addFoo', () => {
    it ('should add FOO to strings', () => {
        expect(addFoo('bar')).to.equal('barBAR');
        expect(addFoo('nem')).to.equal('nemBAR');
    });
});