/**
 * CSE183 Assignment 3 - Basic
 */
class Templater {
  /**
   * Create a templater
   * @param {string} template - A {{ }} tagged string
   */
  constructor(template) {
    this.template = template;
  }

  /**
   * Apply map to template to generate string
   * @param {object} map Object with propeties matching tags in template
   * @param {boolean} strict Throw an Error if any tags in template are
   *     not found in map
   * @return {string} template with all tags replaced
   * @throws An Error if strict is set and any tags in template are not
   *     found in map
   */
  apply(map, strict) {
    let testStr = this.template;
    const re = /([{}])\S+/;

    if (testStr == undefined) {
      return undefined;
    }

    for (const x in map) {
      if (map.hasOwnProperty(x)) {
        testStr = testStr.replace(re, map[x]);
      }
    }

    if (strict && testStr.search(re) != -1) {
      throw console.error('Error: tags in template not found in map.');
    }

    while (testStr.search(re) != -1) {
      testStr = testStr.replace(re, '');
    }

    return testStr.trim();
  }
}

module.exports = Templater;
