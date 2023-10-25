import { Field, SmartContract, state, State, method } from 'o1js';
import { isInteger } from 'o1js/dist/node/bindings/crypto/non-negative';

/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */
export class AgeVerifier extends SmartContract {
  @state(Field) ageLimit = State<Field>();
  init() {
    this.ageLimit.set(Field(18));
    //once you set this, this method will only be run once when the SK is deployed
  }

  //function that basically creates a ZK proof, includes the constraint/restraint that says
  //whether or not the person is of age, and if they can change the age limit
  //so we're going to use the method decorator, and we're going to say "verifyAge"
  //and the input is going to be "userAge" (it's going to be our type Field) and "ageLimitUp"
  //since they can update the age limit, also
  //THIS, below, is our custom logic!

  @method verifyAge(userAge: Field, ageLimitUpdate: Field) {
    //the first thing you want to do is get the age limit from this SK
    //but what is the age limit in this SK?  We're not sure yet!
    //so, to get the age limit we're going to use a simple getter
    //so were going to say, "constant current age limit equals"

    const currentAgeLimit = this.ageLimit.getAndAssertEquals();

    //kim that the SK is actually executed off-line, so you have to make sure
    //that the sk that we're executing off-line has the correct state, and it wld b
    //the state that's stored on-chain, so the way we do that is to get the one that's
    //on chain by using the getter and then we're going to say "currentAgeLimit" on chain

    //up next -- the most interesting part -- where you define your logic as a programmer
    //as to what will satisfy the zk proof before we allow them to do any updates to the sk
    //so, the criteria to satisfy the zkp right now is to check to see whether the age that
    //the person has sent is the age limit that we have for the sk, so say, "userAge.assertEquals
    //(currentAgeLimit) . . ."
    //see code

    //the following line is the most important for defining your constraint for a zkp
    userAge.assertGreaterThanOrEqual(currentAgeLimit);
    //and, you can add more logic too, that says, only if the age limit is "">= 18"
    ageLimitUpdate.assertGreaterThanOrEqual(Field(18));

    this.ageLimit.set(ageLimitUpdate);
  }
}
