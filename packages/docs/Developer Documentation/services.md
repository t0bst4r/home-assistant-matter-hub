# Service Management: AppEnvironment & BridgeEnvironment

## AppEnvironment
- Root environment for the backend application.
- Manages global services: logging, storage, Home Assistant client, bridge service, etc.
- Instantiated at startup with configuration options.
- Example:
```ts
const appEnvironment = await AppEnvironment.create(rootEnv, options);
```
- Provides access to services via `load(ServiceClass)`.

## BridgeEnvironment
- Isolated environment for each bridge instance.
- Manages bridge-specific services: BridgeDataProvider, BridgeEndpointManager, BridgeRegistry, etc.
- Created via `BridgeEnvironment.create(parent, initialData)`.
- Depends on AppEnvironment for shared/global services.
- Example:
```ts
const bridgeEnv = await BridgeEnvironment.create(appEnvironment, bridgeData);
```

## Dependency Structure
- AppEnvironment is the parent/root for all BridgeEnvironments.
- BridgeEnvironment inherits logging, storage, and Home Assistant client from AppEnvironment.
- Bridge-specific services are isolated per bridge.

---

## Service Dependency Graph

### AppEnvironment

- **LoggerService**: Used by all other services for logging.
- **AppStorage** → **BridgeStorage**: AppStorage provides persistent storage, BridgeStorage manages bridge configs.
- **HomeAssistantClient**: Handles connection to Home Assistant.
- **HomeAssistantConfig**: Reads config from HomeAssistantClient.
- **HomeAssistantActions**: Uses HomeAssistantClient to call actions/services on Home Assistant.
- **HomeAssistantRegistry**: Uses HomeAssistantClient to track entity states.
- **BridgeFactory**: Creates Bridge instances.
- **BridgeService**: Manages all bridges, relies on BridgeStorage and BridgeFactory.
- **WebApi**: Exposes REST API, interacts with BridgeService.

### BridgeEnvironment

- **BridgeDataProvider**: Holds bridge-specific data/config.
- **BridgeRegistry**: Uses HomeAssistantRegistry and BridgeDataProvider to track entities for this bridge.
- **BridgeEndpointManager**: Uses HomeAssistantClient and BridgeRegistry to manage endpoints/devices.

---

## Data & Action Flow

### Data Flow
- HomeAssistantClient receives entity states from Home Assistant.
- HomeAssistantRegistry tracks and updates entity states.
- BridgeService manages bridge lifecycle and coordinates refreshes.
- BridgeStorage persists bridge configs and metadata.
- BridgeRegistry (per bridge) filters and manages relevant entities for each bridge.
- BridgeEndpointManager (per bridge) updates endpoints/devices based on BridgeRegistry and entity states.


### Action Flow
- Actions (e.g., turn on/off) are initiated by behaviors (e.g., OnOffServer).
- These call HomeAssistantActions, which uses HomeAssistantClient to invoke Home Assistant services.
- BridgeService can trigger refreshes or lifecycle actions (start, stop, reset) on bridges and endpoints.
- WebApi exposes endpoints for external control, which call BridgeService and propagate actions down to endpoints and Home Assistant.
