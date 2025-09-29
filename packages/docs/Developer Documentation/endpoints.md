# Endpoint Management in Bridges

## Overview
Each bridge exposes child endpoints representing Home Assistant entities. These endpoints are managed and updated to reflect the current state of Home Assistant.

## BridgeEndpointManager
- Responsible for creating, updating, and removing endpoints for a bridge.
- Maintains an aggregator endpoint as the root, grouping all child endpoints.
- Subscribes to Home Assistant entity state changes and updates endpoints accordingly.
- Example:
```ts
const manager = new BridgeEndpointManager(client, registry);
manager.startObserving();
```
- Uses `subscribeEntities` to listen for state changes.

## HomeAssistantRegistry.enableAutoRefresh
- Enables automatic refresh (30 seconds) of endpoints when Home Assistant entity states change.
- Example from `start-handler.ts`:
```ts
enableAutoRefresh = initBridges
  .then(() => Promise.all([registry$, bridgeService$]))
  .then(([r, b]) => r.enableAutoRefresh(() => b.refreshAll()));
```
- Ensures endpoints are always in sync with Home Assistant.

## Endpoint Update Flow
1. Home Assistant entity state changes.
2. Registry triggers auto-refresh callback.
3. BridgeService refreshes all bridges.
4. BridgeEndpointManager updates endpoints/devices.

## State Update Flow
1. BridgeEndpointManager asks BridgeRegistry for included entities.
2. BridgeEndpointManager subscribes to all state changes of the observed entity ids.
3. Whenever a state is changed, it notifies all endpoints about the changes.
