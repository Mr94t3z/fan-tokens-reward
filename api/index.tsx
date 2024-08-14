import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { neynar } from "frog/middlewares";
import { handle } from "frog/vercel";
import { Box, Column, Image, Text, vars } from "../lib/ui.js";
import { moxieSmartContract } from "../lib/contracts.js";
import { decodeEventLog, type Address } from "viem";
import { JSX } from "frog/jsx/jsx-runtime";
import { JSXNode, Child } from "hono/jsx";
import { HtmlEscapedString } from "hono/utils/html";
import { gql, GraphQLClient } from "graphql-request";
import { formatUnits } from "viem";

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
          <img src="/moxielogo.png" width="200" height="50" />
        </Box>
        <Box
          grow
          alignContent="center"
          justifyContent="center"
          alignHorizontal="center"
          alignVertical="center"
          gap="16"
        >
          <Box
            backgroundColor="modal"
            padding-left="18"
            padding-right="18"
            padding-bottom="18"
            padding-top="18"
          >
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              Reward your Fans
            </Text>
          </Box>
          <Text
            size="32"
            color="fontcolor"
            font="subtitle_moxie"
            align="center"
          >
            buy and burn moxie to reward fans
          </Text>
        </Box>
      </Box>
    ),
    intents: [
      <TextInput placeholder="Search for a user or channel" />,
      <Button action="/search-user-channel">Search 🔎 </Button>,
    ],
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
    const data: { tokenLockWallets: { address: string }[] } =
      await graphQLClient.request(query, variable);
    return data.tokenLockWallets[0].address;
  } catch (e) {
    throw new Error(String(e));
  }
}

async function getTokenBalance(ownerAddress: string) {
  const hexBalance = await moxieSmartContract.read.balanceOf([
    ownerAddress as `0x${string}`,
  ]);
  const decimalBalance = BigInt(hexBalance).toString();
  const tokenBalanceInMoxie = formatUnits(BigInt(decimalBalance), 18);
  return tokenBalanceInMoxie;
}

async function getMoxieBalanceInUSD() {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-xYGQqBU93QcE7LW14fhd953Z	",
    },
  };

  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=moxie&vs_currencies=usd",
    options
  );
  const data = await response.json();
  return data.moxie.usd;
}

//Channel/User frame

app.frame("/search-user-channel", async (c) => {
  const verifiedAddresses = c.var.interactor;
  return c.res({
    image: "/img-seach-user-channel",
    intents: [
      <Button action="/check-moxie-amount">Check amount to reward</Button>,
    ],
  });
});

app.image("/img-seach-user-channel", async (c) => {
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
          <img src="/moxielogo.png" width="200" height="50" />
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
            <img src="/" width="200" height="50" />
          </Box>
          <Text
            size="32"
            color="fontcolor"
            font="subtitle_moxie"
            align="center"
          >
            channel/username
          </Text>
          <Box backgroundColor="modal" padding-left="18" paddingRight="18">
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              564 fans
            </Text>
          </Box>
        </Box>
      </Box>
    ),
  });
});

//Amount of moxie to reward frame
app.frame("/check-moxie-amount", async (c) => {
  const verifiedAddresses = c.var.interactor;
  for (const address of verifiedAddresses?.verifiedAddresses.ethAddresses ??
    []) {
    // console.log(address);
    // const contractAddress = await getVestingContractAddress(address);
    // console.log(contractAddress);
    const balance = await getTokenBalance(address);
    const balanceInUSD = await getMoxieBalanceInUSD();
    console.log(balance, balanceInUSD);
    const totalValue = parseInt(balance) * balanceInUSD;
    const totalValueFormatted = totalValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    console.log("totalValueFormatted:", totalValueFormatted);
  }

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
          <img src="/moxielogo.png" width="200" height="50" />
        </Box>
        <Box
          grow
          alignContent="center"
          justifyContent="center"
          alignHorizontal="center"
          alignVertical="center"
          gap="16"
        >
          <Text
            size="32"
            color="fontcolor"
            font="subtitle_moxie"
            align="center"
          >
            You have
          </Text>
          <Box backgroundColor="modal" paddingLeft="18" paddingRight="18">
            <Text size="64" color="fontcolor" font="title_moxie" align="center">
              $13,78
            </Text>
          </Box>
          <Box backgroundColor="modal" padding-left="18" paddingRight="18">
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              2,345,75 MOXIES
            </Text>
          </Box>
          <Text
            size="32"
            color="fontcolor"
            font="subtitle_moxie"
            align="center"
          >
            to reward
          </Text>
        </Box>
      </Box>
    ),
  });
});

//Frame to share moxie
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
          <img src="/moxielogo.png" width="200" height="50" />
        </Box>
        <Box
          grow
          alignContent="center"
          justifyContent="center"
          alignHorizontal="center"
          alignVertical="center"
          gap="16"
        >
          <Text
            size="32"
            color="fontcolor"
            font="subtitle_moxie"
            align="center"
          >
            I just burned
          </Text>
          <Box backgroundColor="modal" padding-left="18" paddingRight="18">
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              2,345,75 MOXIES
            </Text>
          </Box>
          <Text
            size="32"
            color="fontcolor"
            font="subtitle_moxie"
            align="center"
          >
            for reward 564
          </Text>
          <Box backgroundColor="modal" padding-left="18" paddingRight="18">
            <Text size="48" color="fontcolor" font="title_moxie" align="center">
              0x94t3z fans
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
