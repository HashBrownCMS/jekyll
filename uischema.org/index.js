'use strict';

const Processor = require('./server/Processor');

/**
 * The HashBrown uischema.org plugin
 */
class UISchema {
    static init(app) {
        HashBrown.Helpers.ConnectionHelper.registerProcessor(Processor);
    }
}

module.exports = UISchema;
