## Frequently Asked Questions

We will collect all important and frequently asked questions here.

If you are missing something feel free to create a pull request to add it to the documentation.

---

### I cannot pair my controller with my Bridge

Matter is a standardized communication protocol mainly used for Smart Home devices.
This protocol is designed to work best with IPv6 within your local network. At the moment some manufacturers
built their controllers to be compatible with IPv4, too, but this can break at any time with any update.

> [!WARNING]
> Therefore it is strongly recommended to activate IPv6 for your local area network.
> If your current network relies on IPv4, it should be no problem to run both in parallel. Some routers already have
> that activated by default.
>
> In addition, the matter protocol relies on a stable communication over TCP and UDP on port 5353 for mDNS and the
> configured Matter-port of your bridge. Make sure that there is no firewall or VLAN setup in place blocking the
> communication between the bridge and your controller.

This project is based on `matter.js`, which implements the Matter protocol natively in JavaScript.
If you are facing issues pairing your controller, make sure to read the
[Troubleshooting Guide](https://github.com/project-chip/matter.js/blob/main/docs/TROUBLESHOOTING.md) as well as the
[Known Issues](https://github.com/project-chip/matter.js/blob/main/docs/KNOWN_ISSUES.md) of their project.

---

### I want to connect my (single) bridge with multiple controllers like Apple, Google or Alexa

This is absolutely possible. Please see [this guide](./faq/Connect%20Multiple%20Fabrics.md).

---

### I have just added / removed a label at an entity, but the change doesn't take effect in the application

When performing changes on entities, like adding or removing a label, you need to restart the matter-hub application for
the changes to take effect.

---

### I have just created / removed an entity, but the change doesn't take effect in the application

When performing changes on entities, like adding or removing devices in Home Assistant, you need to restart the matter-hub application for
the changes to take effect.

---
