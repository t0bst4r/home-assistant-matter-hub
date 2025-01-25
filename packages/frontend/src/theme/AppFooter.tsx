import { Button, Container, Divider } from "@mui/material";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid2";

const links: { name: string; url: string }[] = [
  {
    name: "GitHub & Documentation",
    url: "https://github.com/t0bst4r/home-assistant-matter-hub/",
  },
];

export const AppFooter = () => {
  return (
    <Container sx={{ mt: 16, mb: 4 }}>
      <Divider sx={{ mt: 4, mb: 4 }} />
      <Grid container spacing={2} justifyContent="center">
        {links.map((link, idx) => (
          <Grid size={{ xs: 12, sm: "auto" }} key={idx}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              component={Link}
              href={link.url}
            >
              {link.name}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
