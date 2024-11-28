import { Navigate, RouteObject } from "react-router";
import { BridgesPage } from "./pages/bridges/BridgesPage.tsx";
import { FundingPage } from "./pages/funding/FundingPage.tsx";
import { AboutPage } from "./pages/about/AboutPage.tsx";
import { BridgeDetailsPage } from "./pages/bridge-details/BridgeDetailsPage.tsx";
import { EditBridgePage } from "./pages/edit-bridge/EditBridgePage.tsx";
import { CreateBridgePage } from "./pages/edit-bridge/CreateBridgePage.tsx";

export const routes: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="/bridges" />,
  },
  {
    path: "bridges",
    element: <BridgesPage />,
  },
  { path: "bridges/create", element: <CreateBridgePage /> },
  { path: "bridges/:bridgeId", element: <BridgeDetailsPage /> },
  { path: "bridges/:bridgeId/edit", element: <EditBridgePage /> },
  {
    path: "funding",
    element: <FundingPage />,
  },
  {
    path: "about",
    element: <AboutPage />,
  },
];
