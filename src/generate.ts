import { PrivateKey } from 'o1js';

const privateKey = PrivateKey.random();
const publicKey = privateKey.toPublicKey();

console.log({
  privateKey,
  publicKey,
});
