const { LXDClient } = require('./lxd')
const Resource = require('nanoresource')
const assert = require('assert')
const debug = require('debug')('little-container-box:lxd:container')
const ready = require('nanoresource-ready')

// quick util
const errback = (p, cb) => p.then((r) => cb(null, r), cb).catch(cb).catch(debug)

/**
 * The `Container` class represents a `nanoresource` mapped to
 * a Linux container managed by the `LXDClient` interface to `lxd`.
 * @public
 * @class
 * @extends {nanoresource}
 * @see {@link https://github.com/lxc/lxd/blob/master/doc/rest-api.md#10containers}
 */
class Container extends Resource {

  /**
   * `Container` class constructor.
   * @param {LXDClient} client
   * @param {String} name
   * @param {?(Object)} opts
   */
  constructor(client, name, opts) {
    super()

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    assert(client instanceof LXDClient,
      'Expecting client to be an `LXDClient` instance.')

    assert(name && 'string' === typeof name,
      'Expecting container name to be a string.')

    this.ref = null
    this.name = name
    this.image = opts.image
    this.client = client
    this.config = opts.config
    this.profile = opts.profile

    this.createIfNotExists = 'boolean' === typeof opts.createIfNotExists
      ? opts.createIfNotExists
      : true
  }

  /**
   * Implements `_open()` for `nanoresource`.
   * @protected
   * @abstract
   * @param {Function} callback
   */
  _open(callback) {
    this.stat((err, info) => {
      if (err) {
        // create if not exists
        if ('HTTPError' === err.name && this.createIfNotExists) {
          console.log(err);
          this.client.launch(this.name, this, (err, info) => {
            if (err) {
              callback(err)
            } else {
              this.ref = info
              callback(null)
            }
          })
        } else {
          callback(err)
        }
      } else {
        this.ref = info
        if ('running' === info.metadata.status.toLowerCase()) {
          callback(null)
        } else {
          errback(this.ref.start(), callback)
        }
      }
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
   * Probes LXD for run time information.
   * @param {Function} callback
   */
  stat(callback) {
    const { client, name } = this
    client.stat(name, callback)
  }

  /**
  */
  start(callback) {
    return this.open(callback)
  }

  /**
  */
  stop(callback) {
    return this.close(callback)
  }
}

/**
 * Module exports.
 */
module.exports = {
  Container
}
