## How do I connect multiple fabrics / controllers like Google Home, Apple Home, or Alexa with a single bridge?

It is definitely possible to connect one bridge with multiple fabrics, but you cannot use the same QR code twice.
We need to commission the bridge with the first controller using the provisioned QR code. After that we need to use the
first controller to connect the bridge to all following controllers.

When you have successfully connected the first controller (e.g. Apple Home), open the app of that controller and find
the Hub device. In Alexa it is listed as an own device. In Apple Home you can find deep in the Home settings. Within the
device settings you can start pairing mode for the device. You will receive a manual pairing code which you can use to
connect it from the next controller.

### Example: Paired with Apple Home, then add it to Alexa

First hit the "more" button in the top right corner of your home:

![More settings menu in Apple Home](../assets/multiple-fabrics-01-apple-home-more.png)

Then select "Home Hubs & Bridges" to find all connected bridges.

![Home Hubs and Bridges in Apple Home](../assets/multiple-fabrics-02-apple-home-settings.png)

From the list of Hubs & Bridges select your Matter hub.

![List of Hubs and Bridges in Apple Home](../assets/multiple-fabrics-03-apple-home-connected-hubs.png)

At the bottom of the Hub details, select "Turn on Pairing Mode".

![Turn on Pairing Mode in Apple Home](../assets/multiple-fabrics-04-apple-home-bridge-details.png)

You will receive a manual pairing code, write it down, you will need it in a second.

![Manual Pairing Code in Apple Home](../assets/multiple-fabrics-05-apple-home-pairing-code.png)

Switch over to the Alexa app and add a new device.

![Add a new Device in Alexa](../assets/multiple-fabrics-06-alexa-add-device.png)

Select "Matter" as kind of the device.

![Select Matter Device in Alexa](../assets/multiple-fabrics-07-alexa-new-matter-device.png)

When asked for "Try Numeric code" or "Scan QR Code", select the numeric code.

![Select numeric code in Alexa](../assets/multiple-fabrics-08-alexa-try-numeric-code.png)

Enter the numeric code you got from Apple Home previously.

![Enter numeric code in Alexa](../assets/multiple-fabrics-09-alexa-enter-numeric-code.png)

Watch Alexa connecting to your bridge, too.

![Connection screen in Alexa](../assets/multiple-fabrics-10-alexa-connecting.png)
