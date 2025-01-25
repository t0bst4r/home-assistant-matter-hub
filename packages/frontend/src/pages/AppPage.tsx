import { Outlet } from "react-router";
import { useEffect } from "react";
import { useAppDispatch } from "../state/hooks.ts";
import { loadBridges } from "../state/bridges/bridge-actions.ts";

export const AppPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadBridges());
  }, [dispatch]);

  return <Outlet />;
};
