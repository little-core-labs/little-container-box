const { LXDClient } = require('../../lxd')
const { Container } = require('../../container')

const client = new LXDClient()
const container = new Container(client, 'test', {
  image: {
    "type": "image",                      
    "certificate": "",                                    
    "alias": "19.10",                                     
    "server": "https://cloud-images.ubuntu.com/releases", 
    "protocol": "simplestreams",             
    "mode": "pull"    
  }
})

container.open((err) => {
  if (err) throw err
  container.stat(console.log)
})
