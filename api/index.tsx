import { Button, Frog, parseEther, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { neynar } from "frog/middlewares";
import { handle } from "frog/vercel";
import { Box, Column, Image, Text, vars } from "../lib/ui.js";
import { publicClient } from "../lib/config.js";
import { decodeEventLog, type Address } from "viem";
import { JSX } from "frog/jsx/jsx-runtime";
import { JSXNode, Child } from "hono/jsx";
import { HtmlEscapedString } from "hono/utils/html";
import { gql, GraphQLClient } from "graphql-request";
import { Alchemy, Network } from "alchemy-sdk";
import { formatUnits } from "viem";
const config = {
  apiKey: "Uc0JyghgIojnMdCrxI_G2md91ZbRiQbe",
  network: Network.BASE_MAINNET,
};
const alchemy = new Alchemy(config);
// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api/frame",
  ui: { vars },
  browserLocation: "",
  imageAspectRatio: "1:1",
  headers: {
    "cache-control":
      "no-store, no-cache, must-revalidate, proxy-revalidate max-age=0, s-maxage=0",
  },
  imageOptions: {
    height: 1024,
    width: 1024,
  },
  title: "Fan Tokens Rewards",
}).use(
  neynar({
    apiKey: process.env.NEYNAR_API_KEY || "NEYNAR_API_DOCS",
    features: ["interactor", "cast"],
  })
);

app.frame("/", async (c) => {
  const { buttonValue, inputText, status } = c;

  return c.res({
    image: (
      <Box
        gap="16"
        grow
        flexDirection="column"
        background="white"
        height="100%"
        padding="48"
      >
        <Box>
          <img src="/moxielogo.png" width="185" height="50" />
        </Box>
        <Box
          grow
          alignContent="center"
          justifyContent="center"
          alignHorizontal="center"
          alignVertical="center"
        >
          <Box backgroundColor="modal" padding-left="18" paddingRight="18">
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              Reward your Fans
            </Text>
          </Box>
        </Box>
      </Box>
    ),
    intents: [<Button action="/check-moxie-amount">Select the amount</Button>],
  });
});

async function getVestingContractAddress(address: string) {
  const graphQLClient = new GraphQLClient(
    "https://api.studio.thegraph.com/query/23537/moxie_vesting_mainnet/version/latest"
  );

  const query = gql`
    query MyQuery($beneficiary: Bytes) {
      tokenLockWallets(where: { beneficiary: $beneficiary }) {
        address: id
      }
    }
  `;
  const variable = {
    beneficiary: `${address}`,
  };

  try {
    const data = await graphQLClient.request(query, variable);
    return data.tokenLockWallets[0].address;
  } catch (e) {
    throw new Error(e);
  }
}

async function getTokenBalance(ownerAddress: string) {
  const data = await alchemy.core.getTokenBalances(ownerAddress, [
    "0x8C9037D1Ef5c6D1f6816278C7AAF5491d24CD527",
  ]);

  console.log("Token balance for Address");
  console.log(data);

  const hexBalance = data.tokenBalances[0].tokenBalance;
  const decimalBalance = BigInt(hexBalance).toString();
  const tokenBalanceInEther = formatUnits(decimalBalance, 18);
  console.log(`Token Balance in USD: ${tokenBalanceInEther}`);
}

app.frame("/check-moxie-amount", async (c) => {
  // const verifiedAddresses = c.var.interactor;
  // for (const address of verifiedAddresses?.verifiedAddresses.ethAddresses) {
  //   // console.log(address);
  //   // const contractAddress = await getVestingContractAddress(address);
  //   // console.log(contractAddress);
  //   const balance = await getTokenBalance(address);
  //   console.log(balance);
  // }

  return c.res({
    image: "/img-moxie-amount",
    intents: [
      <TextInput placeholder="Amount of MOXIE to reward" />,
      <Button action="/share-amount">Reward 100% </Button>,
      <Button action="/share-amount">Reward selected </Button>,
    ],
  });
});

app.image("/img-moxie-amount", async (c) => {
  return c.res({
    image: (
      <Box
        gap="16"
        grow
        flexDirection="column"
        background="white"
        height="100%"
        padding="48"
      >
        <Box>
          <img src="/moxielogo.png" width="185" height="50" />
        </Box>
        <Box
          grow
          alignContent="center"
          justifyContent="center"
          alignHorizontal="center"
          alignVertical="center"
          gap="16"
        >
          <Box backgroundColor="modal" padding-left="18" paddingRight="18">
            <Text size="64" color="fontcolor" font="title_moxie" align="center">
              $13,78
            </Text>
          </Box>
          <Box backgroundColor="modal" padding-left="18" paddingRight="18">
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              2,345,75 MOXIES
            </Text>
          </Box>
          <Box
            backgroundColor="modal"
            padding-left="18"
            paddingRight="18"
            textAlign="center"
          >
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              To reward your fans token owners
            </Text>
          </Box>
        </Box>
      </Box>
    ),
  });
});

app.frame("/share-amount", async (c) => {
  const verifiedAddresses = c.var.interactor;

  return c.res({
    image: (
      <Box
        gap="16"
        grow
        flexDirection="column"
        background="white"
        height="100%"
        padding="48"
      >
        <Box>
          <img src="/moxielogo.png" width="180" height="50" />
        </Box>
        <Box
          grow
          alignContent="center"
          justifyContent="center"
          alignHorizontal="center"
          alignVertical="center"
          gap="16"
        >
          <Box backgroundColor="modal" padding-left="18" paddingRight="18">
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              2,345,75 MOXIES
            </Text>
          </Box>
          <Box backgroundColor="modal" padding-left="18" paddingRight="18">
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              burned for my fans
            </Text>
          </Box>
        </Box>
      </Box>
    ),
    intents: [
      <Button action="/">Share</Button>,
      <Button action="/">Buy Moxie </Button>,
    ],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
