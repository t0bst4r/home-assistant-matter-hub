import { Container } from "@mui/material";
import About from "@home-assistant-matter-hub/documentation/generated/pages/About.md";
import { Markdown } from "../../components/markdown/Markdown.tsx";

export const AboutPage = () => {
  return (
    <Container maxWidth="md">
      <Markdown children={About} />
    </Container>
  );
};
