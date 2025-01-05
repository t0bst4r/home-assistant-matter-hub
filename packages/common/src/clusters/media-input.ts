export interface MediaInputInputInfo {
  index: number;
  inputType: number;
  name: string;
  description: string;
}

export interface MediaInputClusterState {
  currentInput?: number;
  inputList?: MediaInputInputInfo[];
}
