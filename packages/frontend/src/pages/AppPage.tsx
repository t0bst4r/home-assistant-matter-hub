import { useEffect } from "react";
import { Outlet } from "react-router";
import { loadBridges } from "../state/bridges/bridge-actions.ts";
import { useAppDispatch } from "../state/hooks.ts";

export const AppPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadBridges());
  }, [dispatch]);

  return <Outlet />;
};
