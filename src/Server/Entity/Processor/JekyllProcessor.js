'use strict';

const Yaml = require('../../../../lib/yamljs/Yaml');

/**
 * Jekyll processor
 */
class JekyllProcessor extends HashBrown.Entity.Processor.ProcessorBase {
    static get fileExtension() { return '.yml'; }

    /**
     * Compiles content for Jekyll
     *
     * @param {Content} content
     * @param {String} locale
     *
     * @returns {Object} Result
     */
    async process(content, locale) {
        checkParam(content, 'content', HashBrown.Entity.Resource.Content, true);
        checkParam(locale, 'locale', String);
        
        let properties = await content.getLocalizedProperties(locale);
        let meta = content.getMeta();

        if(!properties) {
            throw new Error(`No properties for content "${content.getName()}" with locale "${locale}"`);
        }

        let createdBy = await content.getCreatedBy();
        let updatedBy = await content.getUpdatedBy();

        // We'll have to allow unknown authors, as they could disappear between backups
        if(!createdBy) {
            createdBy = HashBrown.Entity.User.new({
                fullName: 'Unknown',
                username: 'unknown'
            });
        }

        if(!updatedBy) {
            updatedBy = HashBrown.Entity.User.new({
                fullName: 'Unknown',
                username: 'unknown'
            });
        }

        meta.createdBy = createdBy.getName();
        meta.updatedBy = updatedBy.getName();
        meta.locale = locale;

        // Combine all data into one
        let data = {};

        for(let k in properties) {
            data[k] = properties[k];
        }
        
        for(let k in meta) {
            data[k] = meta[k];
        }

        // Date and author go in as main properties in Jekyll, not as meta
        data.date = new Date(data.updatedOn || data.createdOn).toString();
        data.author = updatedBy.fullName || updatedBy.username || createdBy.fullName || createdBy.username;

        // Remap "url" to "permalink"
        if(data.url) {
            data.permalink = data.url;
            delete data.url;
        }

        // Set the layout to the Schema id
        data.layout = data.schemaId;

        let frontMatter = '';

        frontMatter += '---\n';
        frontMatter += Yaml.stringify(properties, 50); 
        frontMatter += '---';

        return frontMatter;
    }
}

module.exports = JekyllProcessor;
