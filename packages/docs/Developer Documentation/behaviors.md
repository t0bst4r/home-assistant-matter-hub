# Behaviors in Home Assistant Matter Hub

## Overview
Behaviors are modular components that implement Matter clusters and map Home Assistant entity state/actions to Matter endpoints. They are used to compose endpoints and define their functionality.

## How Behaviors Work
- Behaviors encapsulate logic for a specific Matter cluster (e.g., OnOff, Identify, LightLevelControl).
- They are composed using the `.with()` method on device types from `@matter/main/devices`.
- Each endpoint is built by combining device types and behaviors, e.g.:

```ts
const LightEndpointType = LightDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  LightOnOffServer,
  LightLevelControlServer,
);
```

- `HomeAssistantEntityBehavior` is a key behavior that synchronizes state and actions between Home Assistant and Matter clusters.

## Configuring Behaviors
- Behaviors are configured by passing options or callbacks (e.g., for state getters/setters).
- Example:
```ts
const InputButtonOnOffServer = OnOffServer({
  isOn: () => false,
  turnOn: () => ({ action: "input_button.press" }),
  turnOff: null,
}).with(["Lighting"]);
```
- Custom behaviors can be created for new device types or clusters.

## Extending Behaviors
- To add a new behavior, implement the required cluster logic and expose configuration options.
- Compose with device types using `.with()`.

## Example: Implementing a Custom Behavior

Below is a short example of how to implement a custom OnOffServer behavior, following the actual pattern used in the codebase:

```ts
import { OnOffServer } from "@matter/main/behaviors";

// Custom implementation for the OnOffServer behavior
export class CustomOnOffServer extends OnOffServer {
  
  override initialize() {
    // Init the behavior
    this.state.onOff = true;
  }

  override on() {
    // device was turned on via matter
  }
  
  override off() {
    // device was turned off via matter
  }
}

// Usage with a device type
const MockSwitchEndpointType = SwitchDevice.with(
  BasicInformationServer,
  IdentifyServer,
  CustomOnOffServer.with(["Lighting"]),
);
```

This pattern can be adapted for any cluster or device type.
