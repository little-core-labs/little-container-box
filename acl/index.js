const { AccessControl } = require('role-acl')
const resources = require('./resources')
const actions = require('./actions')
const roles = require('./roles')

/**
 * `AccessControl` instance with grants defined for this module.
 * @public
 * @default
 * @type {AccessControl}
 * @see {@link https://github.com/tensult/role-acl}
 */
const acl = new AccessControl()

/**
 * Module exports.
 */
module.exports = Object.assign(acl, {
  AccessControl,
  resources,
  actions,
  roles
})
