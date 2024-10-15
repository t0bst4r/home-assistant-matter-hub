import { Navigate } from "react-router-dom";
import { BridgesPage } from "./pages/bridges/BridgesPage.tsx";
import { ReactElement } from "react";
import { Home, Polyline } from "@mui/icons-material";

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
];
