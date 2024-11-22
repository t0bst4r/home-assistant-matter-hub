import { Breadcrumbs, Link } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router";
import { PropsWithChildren } from "react";

const LinkRouter = ({ to, children }: PropsWithChildren<{ to: string }>) => {
  return (
    <Link color="inherit" underline="hover" component={RouterLink} to={to}>
      {children}
    </Link>
  );
};

const nameMapping: [string | RegExp, string][] = [
  ["", "Home"],
  ["/bridges", "Bridges"],
  ["/bridges/create", "Create a Bridge"],
  [/^\/bridges\/\w+\/edit$/, "Edit"],
  ["/funding", "Buy me a Coffee"],
  ["/about", "About this Project"],
];

const Breadcrumb = ({ to }: { to: string }) => {
  const pathParts = to.split("/");
  const fallback = pathParts[pathParts.length - 1];
  const name =
    nameMapping.find(([pattern]) => {
      if (typeof pattern === "string") {
        return to === pattern;
      } else {
        return pattern.test(to);
      }
    })?.[1] ?? fallback;
  return <LinkRouter to={to}>{name}</LinkRouter>;
};

export const AppBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/");

  return (
    <Breadcrumbs sx={{ mb: 4 }}>
      {pathnames.map((_, index) => {
        const to = `${pathnames.slice(0, index + 1).join("/")}`;
        return <Breadcrumb key={to} to={to} />;
      })}
    </Breadcrumbs>
  );
};
