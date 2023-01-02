import * as assert from 'assert';

import * as myExtension from '../extension';

test('globToRegExp test', () => {
    assert.strictEqual(myExtension.globToRegExp("a"), "a");
    assert.strictEqual(myExtension.globToRegExp("a*"), "a[^/\\\\]*");
    assert.strictEqual(myExtension.globToRegExp("*a"), "[^/\\\\]*a");
    assert.strictEqual(myExtension.globToRegExp("a**"), "a.*");
    assert.strictEqual(myExtension.globToRegExp("**a"), ".*a");
    assert.strictEqual(myExtension.globToRegExp("?"), "[^/\\\\]");
    assert.strictEqual(myExtension.globToRegExp("??"), "[^/\\\\][^/\\\\]");
    assert.strictEqual(myExtension.globToRegExp(".+^${}()|[]\\"), "\\.\\+\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");
});
