const { LXDClient } = require('../../lxd')

const client = new LXDClient()
client.open((err) => {
  if (err) throw err
  client.stat(console.log)
})
