import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import { CardActionArea, CardMedia } from "@mui/material";
import Card from "@mui/material/Card";
import Logo from "../../assets/hamh-logo.svg?react";
import QrCode from "@mui/icons-material/QrCode";
import Coffee from "@mui/icons-material/Coffee";
import { ReactNode } from "react";
import { Link } from "react-router";

export const MainPage = () => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <MainPageCard
          href="bridges"
          icon={<QrCode style={{ width: "100%", height: "100%" }} />}
          label="My Bridges"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <MainPageCard
          href="funding"
          icon={<Coffee style={{ width: "100%", height: "100%" }} />}
          label="Buy me a coffee"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <MainPageCard
          href="about"
          icon={<Logo style={{ width: "100%", height: "100%" }} />}
          label="About this Project"
        />
      </Grid>
    </Grid>
  );
};

interface MainPageCardProps {
  icon: ReactNode;
  label: string;
  href: string;
}
const MainPageCard = (props: MainPageCardProps) => {
  return (
    <Card>
      <CardActionArea component={Link} to={props.href}>
        <CardMedia
          sx={{
            height: "140px",
            display: "flex",
            justifyContent: "center",
            p: 2,
          }}
        >
          {props.icon}
        </CardMedia>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" align="center">
            {props.label}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
