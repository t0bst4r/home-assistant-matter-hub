# Troubleshooting for Network and Hub Connectivity Issues

If you're experiencing connectivity issues with your Matter Hub and voice assistants like Apple Home, Google Home, or
Alexa, follow this guide to address common problems.

## 1. Network Configuration and Firewall Settings

### IPv6

- Ensure **IPv6** is properly configured across your router, host, docker, and (if used) virtual machines. Misconfigured
  IPv6 settings can lead to connectivity issues.

### Firewall & VLAN

UDP, including mDNS, is typically not routed across segmented networks. To ensure proper functionality, UDP traffic must
flow freely between all network segments, and IPv6 must be fully operational across your network.

- Avoid VLAN configurations that may segment your network and isolate devices from each other. Ensure all devices,
  including your mobile device during the pairing process, are on the same network segment for seamless communication.
- If VLAN segmentation is unavoidable:
  - **Ports**: Verify that required ports (e.g., **5353, 5540, 5541** - TCP & UDP) are open and correctly routed.
  - **mDNS Forwarding**: Enable mDNS forwarding to allow communication between devices on different network segments.
  - **Firewall**: Ensure your firewall allows the necessary ports. Temporarily disable the firewall to determine if it
    is causing connectivity issues.

### IGMP Snooping

If not configured properly, IGMP Snooping may cause the suppression of mDNS messages. 
For this reason, it is recommended to disable it on networking devices such as switches and, if applicable, Hypervisors & Access Points.

## 2. Ecosystem and Device Compatibility / Requirements

### Alexa

- **Device Limitations**: Alexa cannot pair with a bridge if too many devices (around 80-100) are already attached.
  Remove unused devices to resolve this limitation.
- **Amazon Device Requirement**: Ensure at least one Amazon device supporting Matter is connected. Third-party
  Alexa-enabled devices (e.g. like Sonos) are insufficient for pairing with Matter devices.

### Google Home

- **Matter Hub Requirements**: Google Home requires a dedicated Matter hub, such as a **Google Nest** or
  **Google Mini**, for Matter integration.
- **Offline Devices**: If Google Home displays devices as "offline":
  - Check that a compatible Google Home device (e.g., Google Home Mini) is connected to your local network.
  - Verify that **IPv6** is correctly set up; issues with IPv6 can lead to offline device indications.
- **Certified Matter Device**: Google Home may reject uncertified Matter devices.
  Follow [this guide](https://github.com/project-chip/matter.js/blob/main/docs/ECOSYSTEMS.md#google-home-ecosystem) to
  register your hub properly with Google Home.

## 3. Additional Troubleshooting Tips

- **Logs**: Review logs for specific error messages to identify and resolve configuration issues.
- **Consult Resources**: Refer to
  the [Troubleshooting Guide](https://github.com/project-chip/matter.js/blob/main/docs/TROUBLESHOOTING.md)
  and [Known Issues](https://github.com/project-chip/matter.js/blob/main/docs/KNOWN_ISSUES.md) of the matter.js project.
