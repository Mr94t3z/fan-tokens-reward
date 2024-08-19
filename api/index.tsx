import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { neynar } from "frog/middlewares";
import { handle } from "frog/vercel";
import { Box, Column, Image, Text, vars } from "../lib/ui.js";
import { moxieSmartContract } from "../lib/contracts.js";
import { gql, GraphQLClient } from "graphql-request";
import { formatUnits } from "viem";

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api/frame",
  ui: { vars },
  browserLocation: "",
  imageAspectRatio: "1:1",
  // hub: {
  //   apiUrl: "https://hubs.airstack.xyz",
  //   fetchOptions: {
  //     headers: {
  //       "x-airstack-hubs": process.env.AIRSTACK_API_KEY || '',
  //     }
  //   }
  // },
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

// Initialize the GraphQL client
const graphQLClient = new GraphQLClient(
  "https://api.studio.thegraph.com/query/23537/moxie_protocol_stats_mainnet/version/latest"
);

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


app.frame("/search-user-channel", async (c) => {
  const { inputText } = c;  // Capture the user input from the TextInput

  // Determine whether the inputText is a valid fid or cid
  const isChannel = (inputText ?? "").startsWith("cid:");
  const isFan = (inputText ?? "").startsWith("fid:");

  if (!isChannel && !isFan) {
    // Return an error response if the format is incorrect
    return c.error({
      message: "Invalid input format. Please use `fid:<FID>` or `cid:<Channel Name>`.",
    });
  }

  // Ensure the fanTokenSymbol is correctly prefixed
  const fanTokenSymbol = isChannel ? inputText : isFan ? inputText : `fid:${inputText}`;

  // Define the GraphQL query for the search
  const searchQuery = gql`
    query GetToken($fanTokenSymbol: String) {
      subjectTokens(where: {symbol: $fanTokenSymbol}) {
        id
        name
        symbol
        currentPriceInMoxie
        subject {
          id
        }
      }
    }
  `;
  
  // Execute the query with the correct symbol (fid or cid)
  try {
    const variables = { fanTokenSymbol };
    const data: any = await graphQLClient.request(searchQuery, variables);
    const tokenDetails = data.subjectTokens[0];

    console.log(`Search Results for ${inputText}`);

    if (!tokenDetails) {
      // If no tokenDetails are found, return an error message
      return c.error({
        message: `No results found for ${inputText}.`,
      });
    }

    // Destructure the tokenDetails to extract individual variables
    const { id, name, symbol, currentPriceInMoxie, subject } = tokenDetails;

    // Log each variable
    console.log(`ID: ${id}`);
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Current Price in Moxie: ${currentPriceInMoxie}`);
    console.log(`Subject ID: ${subject?.id}`);

    return c.res({
      image: "/img-seach-user-channel",
      intents: [
        <Button action="/check-moxie-amount">Check amount to reward</Button>,
      ],
    });
  } catch (error) {
    console.error("Error fetching data:", error);

    return c.error({
      message: "No results found for the user or channel.",
    });
  }
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
          <Text
            size="20"
            color="fontcolor"
            font="subtitle_moxie"
            align="center"
          >
            Your Balance:
          </Text>
          <Box display="flex" flexDirection="row" gap="16">
            <Text color="fontcolor" font="subtitle_moxie" align="center">
              Wallet: (0x85…rt748)
            </Text>
            <Box
              backgroundColor="modal"
              paddingLeft="18"
              paddingRight="18"
              borderRadius="80"
            >
              <Text color="fontcolor" font="subtitle_moxie" align="center">
                M 2,345,75{" "}
              </Text>
            </Box>
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
