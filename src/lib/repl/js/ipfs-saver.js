// IPFS saver
import IPFS from 'ipfs-browser-global'
IPFS() // preload before .save() is called

  const assertIpfs = async () => {
    if (!ipfs) {
      await IPFS()
    } else {
      await ipfs
    }    
  }

export default class Saver {
  // save individual components
  // save the compiled code page
  // save the whole rollup

  async save (objectToSave) {
    // 1. source code components
    // 2. compiled/bundled results
    await assertIpfs()
    return await ipfs.dag.put(objectToSave, { pin: true })
  }

  async add (content){
    
    await assertIpfs()

    const result = await ipfs.add(content, {
      pin: true,
      wrapWithDirectory: true
    })
    return result
  }

}
