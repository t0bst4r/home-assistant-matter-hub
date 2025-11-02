# Connect multiple assistants to one bridge

It is possible to connect a single bridge with multiple fabrics, but note that the same QR code cannot be
used twice. The process involves commissioning the bridge with the first controller using the provided QR code.
Subsequently, you can use the first controller to link the bridge to additional controllers.

After successfully connecting the first controller (e.g., Apple Home), locate the hub device in the app. For Alexa, it
appears as a standalone device, while in Apple Home, it is nested within the Home settings. In the device settings,
enable pairing mode to generate a manual pairing code. This code can then be used to connect the bridge to subsequent
controllers.

---

## Example: Pairing with Apple Home and Adding to Alexa

1. **Access "More" Settings in Apple Home**
   Open the Apple Home app, and tap the "More" button in the top-right corner of your home screen:

   ![More settings menu in Apple Home](../assets/ConnectMultipleFabrics/multiple-fabrics-01-apple-home-more.png)

2. **Locate Hubs & Bridges**
   Navigate to "Home Hubs & Bridges" to view all connected bridges:

   ![Home Hubs and Bridges in Apple Home](../assets/ConnectMultipleFabrics/multiple-fabrics-02-apple-home-settings.png)

3. **Select Your Bridge**
   From the list of hubs, choose your Matter hub:

   ![List of Hubs and Bridges in Apple Home](../assets/ConnectMultipleFabrics/multiple-fabrics-03-apple-home-connected-hubs.png)

4. **Enable Pairing Mode**
   Scroll to the bottom of the hub details and select "Turn on Pairing Mode":

   ![Turn on Pairing Mode in Apple Home](../assets/ConnectMultipleFabrics/multiple-fabrics-04-apple-home-bridge-details.png)

5. **Retrieve the Pairing Code**
   A manual pairing code will be displayed. Make a note of this code for later use:

   ![Manual Pairing Code in Apple Home](../assets/ConnectMultipleFabrics/multiple-fabrics-05-apple-home-pairing-code.png)

6. **Add the Device to Alexa**
   Open the Alexa app and select "Add Device":

   ![Add a new Device in Alexa](../assets/ConnectMultipleFabrics/multiple-fabrics-06-alexa-add-device.png)

7. **Select Device Type**
   Choose "Matter" as the device type:

   ![Select Matter Device in Alexa](../assets/ConnectMultipleFabrics/multiple-fabrics-07-alexa-new-matter-device.png)

8. **Choose Pairing Method**
   When prompted, select "Try Numeric Code" instead of scanning a QR code:

   ![Select numeric code in Alexa](../assets/ConnectMultipleFabrics/multiple-fabrics-08-alexa-try-numeric-code.png)

9. **Enter the Pairing Code**
   Input the manual pairing code retrieved from Apple Home:

   ![Enter numeric code in Alexa](../assets/ConnectMultipleFabrics/multiple-fabrics-09-alexa-enter-numeric-code.png)

10. **Complete the Connection**
    Allow Alexa to establish the connection to your bridge:

    ![Connection screen in Alexa](../assets/ConnectMultipleFabrics/multiple-fabrics-10-alexa-connecting.png)
