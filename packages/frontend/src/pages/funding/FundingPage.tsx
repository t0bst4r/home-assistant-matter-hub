import AppreciateIt from "../../assets/undraw_appreciate_it.svg?react";
import BuyMeACoffee from "../../assets/bmc-button.svg?react";
import { Link, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const buyMeACoffeeUrl = "https://buymeacoffee.com/t0bst4r";

export const FundingPage = () => {
  return (
    <>
      <Stack direction="column" spacing={8} pt={8}>
        <Box display="flex" justifyContent="center">
          <AppreciateIt height={420} />
        </Box>
        <Box display="flex" justifyContent="center">
          <Typography variant="h1">Thank you!</Typography>
        </Box>
        <Box display="flex" justifyContent="center">
          <Link href={buyMeACoffeeUrl} target="_blank">
            <BuyMeACoffee width={200} />
          </Link>
        </Box>
      </Stack>
    </>
  );
};
