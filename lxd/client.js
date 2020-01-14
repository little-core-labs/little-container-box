const Resource = require('nanoresource')
const assert = require('assert')
const ready = require('nanoresource-ready')
const debug = require('debug')('little-container-box:lxd:client')
const lxd = require('ts-lxd')

// quick util
const errback = (p, cb) => p.then((r) => cb(null, r)).catch(cb).catch(debug)

/**
 * The `LXDClient` class represents a `nanoresource` mapped to a client
 * connection interface for `lxd(1)` that implements the LXC Rest API.
 * @public
 * @class
 * @see {@link https://github.com/trufflesuite/ts-lxd}
 * @see {@link https://github.com/lxc/lxd/blob/master/doc/rest-api.md}
 */
class LXDClient extends Resource {

  /**
   * `LXDClient` class constructor.
   * @param {String} host
   * @param {?(Object)} opts
   */
  constructor(host, opts) {
    super()

    this.client = new lxd.Client(host, opts)
  }

  /**
   * Implements `_open()` for `nanoresource`.
   * @protected
   * @abstract
   * @param {Function} callback
   */
  _open(callback) {
    errback(this.client.getInfo(), (err) => {
      if (err) { callback(err) }
      else { callback(null) }
    })
  }

  /**
   * Implements `_close()` for `nanoresource`.
   * @protected
   * @abstract
   * @param {Function} callback
   */
  _close(callback) {
    process.nextTick(callback, null)
  }

  /**
   * Waits for `nanoresource` instance to be ready (opened)
   * and then calls `callback()` upon success or error.
   * @param {Function} callback
   */
  ready(callback) {
    ready(this, callback)
  }

  /**
   * Probes LXD for run time information. Will look up container
   * information if a name is given, otherwise information about the
   * `lxd(1)` process itself is returned.
   * @param {?(String)} name
   * @param {Function} callback
   */
  stat(name, callback) {
    if (name && 'string' === typeof name) {
      errback(this.client.getContainer(name), callback)
    } else {
      errback(this.client.getInfo(), callback)
    }
  }

  /**
   * Creates a container in the LXD runtime.
   * @param {String} name
   * @param {Object} opts
   * @param {Function} callback
   */
  create(name, opts, callback) {
    assert(name && 'string' === typeof name,
      'Expecting name to be a string.')

    assert(opts && 'object' === typeof opts,
      'Expecting options to be an object.')


    createContainer(this.client, name, opts, callback)
  }

  /**
   * Launches a container in the LXD runtime.
   * @param {String} name
   * @param {Object} opts
   * @param {Function} callback
   */
  launch(name, opts, callback) {
    assert(name && 'string' === typeof name,
      'Expecting name to be a string.')

    assert(opts && 'object' === typeof opts,
      'Expecting options to be an object.')


    launchContainer(this, name, opts, callback)
  }
}

/**
 * @private
 */
function createContainer(client, name, opts, callback) {
  const { config } = opts
  const architecture = 'x86_64'
  const ephemeral = Boolean(opts.ephemeral)
  const profiles = [opts.profile ? opts.profile : 'default']
  const source = 'string' === typeof opts.image
    ? { type: 'image', alias: opts.image }
    : opts.image

  const req = {
    path: 'POST /containers',
    body: {
      name,
      architecture,
      profiles,
      ephemeral,
      config,
      source
    }
  }

  errback(client.client.request(req), (err) => {
    if (err) { callback(err) }
    else { client.stat(name, callback) }
  })
}

/**
 * @private
 */
function launchContainer(client, name, opts, callback) {
  createContainer(client, name, opts, (err, ref) => {
    if (err) { callback(err) }
    else { errback(ref.start(), callback) }
  })
}

/**
 * Module exports.
 */
module.exports = {
  LXDClient
}
