import { Navigate } from "react-router-dom";
import { BridgesPage } from "./pages/bridges/BridgesPage.tsx";
import { ReactElement } from "react";
import { Coffee, Help, Home, Polyline } from "@mui/icons-material";
import { FundingPage } from "./pages/funding/FundingPage.tsx";
import { AboutPage } from "./pages/about/AboutPage.tsx";

export interface Route {
  readonly segment: string;
  readonly title?: string;
  readonly element: ReactElement;
  readonly icon: ReactElement;
  readonly children?: Omit<Route, "icon" | "title">[];
}

export const routes: Route[] = [
  {
    segment: "",
    element: <Navigate to="/bridges" />,
    icon: <Home />,
  },
  {
    segment: "bridges",
    title: "Bridges",
    element: <BridgesPage />,
    icon: <Polyline />,
    children: [{ segment: ":bridgeId", element: <BridgesPage /> }],
  },
  {
    segment: "funding",
    title: "Buy me a coffee",
    element: <FundingPage />,
    icon: <Coffee />,
  },
  {
    segment: "about",
    title: "About this project",
    element: <AboutPage />,
    icon: <Help />,
  },
];
