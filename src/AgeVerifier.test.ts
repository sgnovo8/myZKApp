import { AgeVerifier } from './AgeVerifier';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate } from 'o1js';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('AgeVerifier', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: AgeVerifier;

  beforeAll(async () => {
    if (proofsEnabled) await AgeVerifier.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new AgeVerifier(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });

    //according to Mina docs, what this line does is go through your transactions and looks for anything that's
    //happening and making sure the tx is valid such as account updates.  The tx may not only be responsible for
    //validating a proof such as a zkp that you create but they also need to validate other other things within
    //the tx, such as does this person have enough funds in their acct to be able to deploy this tx?  E.g.
    //I think Mina uses cryptographic proofs to validate everything about the txs
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `AgeVerifier` smart contract', async () => {
    await localDeploy();
    const num = zkApp.ageLimit.get();
    expect(num).toEqual(Field(18));
  });

  it('correctly fails the person is younger than the age limit', async () => {
    await localDeploy();

    // update transaction
    const txn = await Mina.transaction(senderAccount, () => {
      zkApp.verifyAge(Field(20), Field(21));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const updatedNum = zkApp.ageLimit.get();
    expect(updatedNum).toEqual(Field(21));
  });
});
