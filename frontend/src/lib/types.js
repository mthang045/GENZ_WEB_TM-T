/**
 * @typedef {Object} ProductVariant
 * @property {string} color
 * @property {string} size
 * @property {number} quantity
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} image
 * @property {string} category
 * @property {string} brand
 * @property {number} rating
 * @property {string} description
 * @property {string[]} features
 * @property {string[]} colors
 * @property {string[]} sizes
 * @property {boolean} inStock
 * @property {ProductVariant[]} [inventory]
 * @property {Object.<string, string>} [colorImages]
 */

/**
 * @typedef {Object} CartItem
 * @property {string} productId
 * @property {number} quantity
 * @property {string} selectedColor
 * @property {string} selectedSize
 */