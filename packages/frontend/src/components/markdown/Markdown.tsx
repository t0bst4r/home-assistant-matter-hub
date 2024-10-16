import ReactMarkdown, { Components } from "react-markdown";
import Typography from "@mui/material/Typography";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import Box from "@mui/material/Box";
import { Blockquote } from "./Blockquote.tsx";
import { GithubAlert } from "./GithubAlert.tsx";
import { Paper } from "@mui/material";

export interface MarkdownProps {
  children: string;
}

export const Markdown = (props: MarkdownProps) => {
  return (
    <ReactMarkdown
      children={props.children}
      rehypePlugins={[rehypeGithubAlerts]}
      components={components}
    />
  );
};

const components: Components = {
  div: (props) => {
    const classNames = props.className?.split(/\s+/) ?? [];
    const isAlert = classNames.includes("markdown-alert");
    const severity = classNames
      .find((c) => c.startsWith("markdown-alert-"))
      ?.substring(15);
    return isAlert ? (
      <GithubAlert
        children={props.children}
        severity={severity}
        className={props.className}
      />
    ) : (
      <Box className={props.className}>{props.children}</Box>
    );
  },
  h1: (props) => (
    <Typography
      variant="h4"
      component="h1"
      pt={3}
      pb={1}
      className={props.className}
    >
      {props.children}
    </Typography>
  ),
  h2: (props) => (
    <Typography
      variant="h5"
      component="h2"
      pt={3}
      pb={1}
      className={props.className}
    >
      {props.children}
    </Typography>
  ),
  h3: (props) => (
    <Typography
      variant="h6"
      component="h3"
      pt={3}
      pb={1}
      className={props.className}
    >
      {props.children}
    </Typography>
  ),
  h4: (props) => (
    <Typography
      variant="h6"
      component="h4"
      pt={3}
      pb={1}
      className={props.className}
    >
      {props.children}
    </Typography>
  ),
  h5: (props) => (
    <Typography
      variant="h6"
      component="h5"
      pt={3}
      pb={1}
      className={props.className}
    >
      {props.children}
    </Typography>
  ),
  h6: (props) => (
    <Typography
      variant="h6"
      component="h6"
      pt={3}
      pb={1}
      className={props.className}
    >
      {props.children}
    </Typography>
  ),
  p: (props) => (
    <Typography variant="body1" className={props.className}>
      {props.children}
    </Typography>
  ),
  blockquote: (props) => (
    <Blockquote children={props.children} className={props.className} />
  ),
  pre: (props) => (
    <Paper
      className={props.className}
      component="pre"
      elevation={2}
      sx={{ p: 2 }}
    >
      {props.children}
    </Paper>
  ),
  code: (props) => (
    <Typography
      component="code"
      sx={{
        fontFamily: "monospace",
        fontSize: "0.9em",
      }}
      className={props.className}
    >
      {props.children}
    </Typography>
  ),
};
