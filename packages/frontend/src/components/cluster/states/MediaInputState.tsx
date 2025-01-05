import { MediaInputClusterState } from "@home-assistant-matter-hub/common";
import InputIcon from "@mui/icons-material/Input";

export interface MediaInputStateProps {
  state: MediaInputClusterState;
}

export const MediaInputState = ({ state }: MediaInputStateProps) => {
  const input = state.inputList?.find(
    (input) => input.index === state.currentInput,
  );
  const inputText = input ? input.name : "Unknown";
  console.log(input, inputText, state);
  return (
    <>
      <InputIcon fontSize="medium" />
      <span>{inputText}</span>
    </>
  );
};
