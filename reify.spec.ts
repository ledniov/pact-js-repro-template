import chai from "chai";
import { MatchersV3 } from "@pact-foundation/pact"

const { expect } = chai;

describe("reify", () => {

  it("should properly reify object with null type matcher", () => {
    const myObj = {
      stringProp: MatchersV3.string("sample string"),
      nullProp: MatchersV3.nullValue()
    }

    const reifiedObj = MatchersV3.reify(myObj)

    expect(reifiedObj).to.deep.equal({
      stringProp: "sample string",
      nullProp: null
    })
  })

})
