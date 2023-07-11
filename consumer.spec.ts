import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  SpecificationVersion,
  PactV3,
  LogLevel,
  MatchersV3,
} from "@pact-foundation/pact";
import axios from "axios";

chai.use(chaiAsPromised);

const { expect } = chai;

describe("Pact Consumer Test", () => {
  const pact = new PactV3({
    consumer: "myconsumer",
    provider: "myprovider",
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
    logLevel: (process.env.LOG_LEVEL as LogLevel) || "info",
  });

  it("creates a pact to verify", async () => {
    await pact
      .addInteraction({
        uponReceiving: "a request for a foo",
        withRequest: {
          method: "GET",
          path: "/",
        },
        willRespondWith: {
          status: 200,
          body: {
            foo: MatchersV3.like("bar"),
          },
        },
      })
      .executeTest(async (mockserver) => {
        const res = await axios.request({
          baseURL: mockserver.url,
          method: "GET",
          url: "/",
        });

        expect(res.data.foo).to.equal("bar");
      });
  });
});
