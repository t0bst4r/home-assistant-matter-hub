import { Navigate, RouteObject } from "react-router";
import { BridgesPage } from "./pages/bridges/BridgesPage.tsx";
import { BridgeDetailsPage } from "./pages/bridge-details/BridgeDetailsPage.tsx";
import { EditBridgePage } from "./pages/edit-bridge/EditBridgePage.tsx";
import { CreateBridgePage } from "./pages/edit-bridge/CreateBridgePage.tsx";
import { AppPage } from "./pages/AppPage.tsx";

export const navigation = {
  bridges: "/bridges",
  bridge: (bridgeId: string) => `/bridges/${bridgeId}`,
  createBridge: "/bridges/create",
  editBridge: (bridgeId: string) => `/bridges/${bridgeId}/edit`,

  githubRepository: "https://github.com/t0bst4r/home-assistant-matter-hub/",
  faq: {
    multiFabric:
      "https://github.com/t0bst4r/home-assistant-matter-hub/blob/main/packages/documentation/faq/Connect%20Multiple%20Fabrics.md",
  },
};

export const routes: RouteObject[] = [
  {
    path: "",
    element: <AppPage />,
    children: [
      {
        path: "",
        element: <Navigate to={navigation.bridges} replace={true} />,
      },
      { path: navigation.bridges, element: <BridgesPage /> },
      { path: navigation.createBridge, element: <CreateBridgePage /> },
      { path: navigation.bridge(":bridgeId"), element: <BridgeDetailsPage /> },
      { path: navigation.editBridge(":bridgeId"), element: <EditBridgePage /> },
    ],
  },
];
