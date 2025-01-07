import { Navigate, RouteObject } from "react-router";
import { BridgesPage } from "./pages/bridges/BridgesPage.tsx";
import { BridgeDetailsPage } from "./pages/bridge-details/BridgeDetailsPage.tsx";
import { EditBridgePage } from "./pages/edit-bridge/EditBridgePage.tsx";
import { CreateBridgePage } from "./pages/edit-bridge/CreateBridgePage.tsx";

export const routes: RouteObject[] = [
  {
    path: "",
    element: <BridgesPage />,
  },
  { path: "bridges", element: <Navigate to="/" replace={true} /> },
  { path: "bridges/create", element: <CreateBridgePage /> },
  { path: "bridges/:bridgeId", element: <BridgeDetailsPage /> },
  { path: "bridges/:bridgeId/edit", element: <EditBridgePage /> },
];
