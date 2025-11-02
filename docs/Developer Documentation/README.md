# Developer Documentation

## Overview

Home Assistant Matter Hub (HAMH) is an addon for Home Assistant that acts as a Matter bridge, exposing Home Assistant devices to Matter controllers (Alexa, Apple Home, Google Home) via local communication. No cloud or custom skills are required.

This documentation is intended for developers taking over or contributing to the project. It covers architecture, technologies, and key concepts, especially those related to the Matter protocol and bridging logic.

---

## Documentation Structure

- [Behaviors](./behaviors.md): How behaviors work, configuration, and extension.
- [Service Management](./services.md): AppEnvironment, BridgeEnvironment, and service dependencies.
- [Endpoint Management](./endpoints.md): How bridge endpoints are managed and updated.

---

## Technologies Used

- **TypeScript**: Main language for backend, frontend, and shared logic.
- **Node.js**: Runtime for backend services and CLI.
- **Express**: REST API for bridge management.
- **Vite**: Frontend build tool.
- **React**: Frontend UI framework.
- **@matter/main, @matter/nodejs, @matter/general**: Libraries implementing the Matter protocol and device abstractions.
- **home-assistant-js-websocket**: Integration with Home Assistant's API.
- **Ajv**: JSON schema validation for API requests.
- **Docker**: Containerization for deployment.

---

## Architecture

### High-Level Structure

- **Backend** (`packages/backend`): Implements bridge logic, Matter protocol, Home Assistant integration, and exposes REST API.
- **Frontend** (`packages/frontend`): UI for managing bridges and devices.
- **Common** (`packages/common`): Shared types and utilities.
- **Docs** (`packages/docs`): Documentation and guides.

### Key Backend Components

- **BridgeService**: Manages lifecycle of bridges (create, update, delete, start, stop, refresh).
- **Bridge**: Represents a running bridge instance, including Matter server node and aggregator.
- **BridgeFactory**: Abstract factory for creating bridges.
- **BridgeStorage**: Persists bridge configurations and metadata.
- **BridgeEndpointManager**: Manages endpoints/devices exposed by a bridge.
- **HomeAssistantClient**: Handles connection and communication with Home Assistant.
- **HomeAssistantActions**: Invokes Home Assistant services (turn on/off, etc).

---

## Matter Concepts & Library Usage

### Matter Bridge

A bridge is a Matter node that exposes multiple endpoints (devices) to controllers. In HAMH, each bridge is backed by a Matter server node and an aggregator endpoint.

- **BridgeServerNode**: Subclass of `ServerNode` from `@matter/main/node`. Configured with bridge metadata and endpoints.
- **AggregatorEndpoint**: Root endpoint that groups all exposed devices.
- **Endpoints**: Each Home Assistant entity is mapped to a Matter endpoint (e.g., light, switch, sensor).

See [Endpoint Management](./endpoints.md) for details on how endpoints are created, updated, and synchronized.

### Endpoints & Behaviors

Endpoints are created using device types from `@matter/main/devices` and composed with behaviors:

- **BasicInformationServer**: Provides device metadata.
- **IdentifyServer**: Implements Matter identify cluster.
- **HomeAssistantEntityBehavior**: Maps Home Assistant entity state/actions to Matter clusters.
- **OnOffServer, LightLevelControlServer, etc.**: Implements specific device clusters (on/off, dimming, color, etc).

Example (Dimmable Light):
```ts
export const DimmableLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantEntityBehavior,
  LightOnOffServer,
  LightLevelControlServer,
);
```

See [Behaviors](./behaviors.md) for a deep dive into how behaviors work and are configured.

### Server Node Configuration

Bridge server nodes are configured using `createBridgeServerConfig`, which sets up:
- Node type and ID
- Network port
- Product/device metadata
- Aggregator endpoint

### Bridge Lifecycle

- **Create**: BridgeService creates a new Bridge via BridgeFactory, persists config in BridgeStorage.
- **Start/Stop**: Bridge manages its Matter server node and endpoints.
- **Refresh**: BridgeEndpointManager updates device states from Home Assistant.
- **Factory Reset**: BridgeServerNode can be reset and erased.

---

## Home Assistant Integration

- **HomeAssistantClient**: Connects to Home Assistant via websocket, maintains connection.
- **HomeAssistantActions**: Calls Home Assistant services (e.g., `light.turn_on`).
- **Entity Mapping**: Each Home Assistant entity is mapped to a Matter endpoint with appropriate behaviors.
- **State Sync**: BridgeEndpointManager subscribes to entity state changes and updates endpoints.

---

## REST API

Exposed via Express (`matterApi`):
- `/bridges` (GET, POST): List/create bridges
- `/bridges/:bridgeId` (GET, PUT, DELETE): Get/update/delete bridge
- `/bridges/:bridgeId/devices` (GET): List devices for a bridge
- `/bridges/:bridgeId/actions/factory-reset` (GET): Factory reset bridge

---

## Development & Handover Notes

- **Start with backend**: Understand BridgeService, Bridge, BridgeEndpointManager, and HomeAssistantClient.
- **Matter concepts**: Familiarize yourself with Matter node, endpoint, aggregator, and cluster abstractions in `@matter` libraries.
- **Entity mapping**: Review how Home Assistant entities are mapped to endpoints and behaviors.
- **Frontend**: UI is in React, communicates with backend via REST API.
- **Docker**: Use provided Dockerfiles for deployment/testing.
- **Testing**: Use provided scripts and test files for backend logic.

---

## Further Reading

- [Matter Protocol Specification](https://csa-iot.org/all-solutions/matter/)
- [Home Assistant Developer Docs](https://developers.home-assistant.io/)
- [HAMH User Documentation](https://t0bst4r.github.io/home-assistant-matter-hub)

---

## Contact & Maintainer

See [GitHub Discussions](https://github.com/t0bst4r/home-assistant-matter-hub/discussions/825) for handover or maintainer inquiries.
