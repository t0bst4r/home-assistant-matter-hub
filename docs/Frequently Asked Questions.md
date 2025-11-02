# Frequently Asked Questions

## I've got connectivity issues, what can I do?

Please follow the [troubleshooting guide](./Guides/Connectivity%20Issues.md).

## I'd like to connect my bridge to multiple assistants

Please follow the [multi-fabric guide](./Guides/Connect%20Multiple%20Fabrics.md).

## I'm running HAMH as a docker image and want to access it via a reverse proxy

Please follow the [reverse proxy guide](./Guides/Reverse%20Proxy.md).

## Changes on names and labels in Home Assistant have no effect in HAMH

When performing changes on entities, like adding or removing a label or renaming your entity, you need to reload the
affected bridge for the changes to take effect. This happens automatically every 30 seconds, but you can enforce it by
editing the bridge (even without making changes), or when restarting the whole addon.

## I added a label to my entities, but HAMH won't find any device

- Labels and areas in Home Assistant are technically represented by their "slugs".
- Slugs are technical identifiers used in the background.
- Slugs are always lowercase and only allow a-z and underscores, so everything else will be replaced with an
  underscore.
- Even when renaming a label or area, the slug doesn't change. Never.
  You can retrieve the slug using the following templates in Home Assistant:
- `{{ labels() }}` - returns all labels
- `{{ labels("light.my_entity") }}` - returns the labels of a specific entity
- `{{ areas() }}` - returns all areas

If you just can't get it working with your labels, try to delete your label and re-create it.

## My Vacuum does not appear in the Apple Home App

Ensure that **all** home hubs in the Apple Home app are updated to **iOS/tvOS/AudioOS 18.4** or later – if **any** home hub is below 18.4, the vacuum device will not show up. To resolve this:

1. **Check for updates**  
   - **iPhone / iPad**:  
     `Settings > General > Software Update`  
   - **HomePod**:  
     Open the Home app → Home Settings → Software Update  
   - **Apple TV**:  
     `Settings > System > Software Updates`

2. **Install any pending updates**, then **restart** each hub.

3. **Relaunch** the Home app and confirm the vacuum now appears under your accessories.
