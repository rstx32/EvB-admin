function generate() {
  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf))
  }

  async function exportCryptoPrivKey(key) {
    const exported = await window.crypto.subtle.exportKey('pkcs8', key)
    const exportedAsString = ab2str(exported)
    const exportedAsBase64 = window.btoa(exportedAsString)
    const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`

    console.log(pemExported)
  }

  async function exportCryptoPubKey(key) {
    const exported = await window.crypto.subtle.exportKey('spki', key)
    const exportedAsString = ab2str(exported)
    const exportedAsBase64 = window.btoa(exportedAsString)
    const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`

    document.getElementById("public_key").value = pemExported;
    console.log(pemExported)
  }

  window.crypto.subtle
    .generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify']
    )
    .then((keyPair) => {
      exportCryptoPrivKey(keyPair.privateKey)
      exportCryptoPubKey(keyPair.publicKey)
    })
}
