import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import { navigation } from "../routes.tsx";

const links: { name: string; url: string }[] = [
  {
    name: "GitHub",
    url: navigation.githubRepository,
  },
  {
    name: "Documentation",
    url: navigation.documentation,
  },
];

export const AppFooter = () => {
  return (
    <Container sx={{ mt: 16, mb: 4 }}>
      <Divider sx={{ mt: 4, mb: 4 }} />
      <Grid container spacing={2} justifyContent="center">
        {links.map((link, idx) => (
          <Grid size={{ xs: 12, sm: "auto" }} key={idx.toString()}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              component={Link}
              href={link.url}
              target="_blank"
            >
              {link.name}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
