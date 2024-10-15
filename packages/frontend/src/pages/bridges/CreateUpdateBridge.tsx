import {
  BridgeData,
  CreateBridgeRequest,
  HomeAssistantMatcherType,
  UpdateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import Box from "@mui/material/Box";
import { DialogProps } from "@toolpad/core";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

export type CreateUpdateBridgeProps =
  | DialogProps<undefined, CreateBridgeRequest | undefined>
  | DialogProps<BridgeData, UpdateBridgeRequest | undefined>;

const createRequest: CreateBridgeRequest = {
  name: "Test",
  filter: {
    include: [{ type: HomeAssistantMatcherType.Label, value: "matterhub" }],
    exclude: [],
  },
};

export const CreateUpdateBridge = (props: CreateUpdateBridgeProps) => {
  const save = async () => {
    if (props.payload == undefined) {
      await props.onClose(createRequest);
    } else {
      await props.onClose({ ...createRequest, id: props.payload.id });
    }
  };

  return (
    <Dialog
      fullWidth
      open={props.open}
      onClose={() => props.onClose(undefined)}
    >
      <DialogTitle>
        {props.payload ? `Update ${props.payload.name}` : "Create a new Bridge"}
      </DialogTitle>
      <DialogContent>
        <Box>Hi</Box>
        <pre>{JSON.stringify(createRequest, undefined, 2)}</pre>
      </DialogContent>
      <DialogActions>
        <button onClick={() => save()}>Create</button>
      </DialogActions>
    </Dialog>
  );
};
