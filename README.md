<div align="center">

# 🔌 ⚡ homebridge-api-state-switch
Create virtual HomeKit switches whose ON/OFF state is controlled entirely by polling an API endpoint.

</div>

<p align="center">
  <img src="https://github.com/tomaldy/homebridge-api-state-switch/actions/workflows/release.yml/badge.svg" alt="Build Status" />
  <img src="https://img.shields.io/npm/v/homebridge-api-state-switch.svg" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/homebridge-api-state-switch.svg" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/tomaldy/homebridge-api-state-switch.svg" alt="License" />
</p>

<p align="center">
  <a href="https://buymeacoffee.com/tomaldy" target="_blank">
    <img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=tomaldy&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me A Coffee" />
  </a>
</p>

---
This Homebridge plugin lets you expose **virtual switches** that automatically flip ON or OFF based on the results of a **GET request** to **any HTTP API**.

It's perfect for things like:

- 🗑️ Bin day reminders
- 📅 “Is today a holiday?”
- 🌦️ “Is it raining right now?”
- 🚗 “Is the car charging?”
- 🖥️ “Is this server online?”
- 🧹 “Is the robot vacuum currently cleaning?”
- 🛏️ Presence / status switches
- 🌡️ Custom sensor states from any backend you build

You write the API → Homebridge polls it → HomeKit gets a virtual switch with real-time state.

No control endpoints required.  
No devices needed.  
Just pure API → Switch state binding.

---

## ✨ Features

- Polls any HTTP GET endpoint on an interval
- Converts API responses into HomeKit switch ON/OFF state
- Optional `jsonPath` to extract boolean values from JSON
- Optionally **read-only** (user cannot toggle the switch)
- Supports multiple switches
- Works with Siri, automations, scenes, widgets
- Designed using the latest official Homebridge plugin template
- Lightweight & fast — no cloud dependencies

---

## 📦 Installation

### Through Homebridge UI (recommended)

1. Open **Homebridge Config UI X**
2. Go to **Plugins**
3. Search for:  
   **`homebridge-api-state-switch`**
4. Install
5. Restart Homebridge

---

## ⚙️ Configuration

Add this to your `config.json` (or use the UI settings panel):

```json
{
  "platform": "ApiStateSwitchPlatform",
  "switches": [
    {
      "name": "Bin Day",
      "url": "https://my-api.dev/bins/today",
      "jsonPath": "today.isBinDay",
      "interval": 3600,
      "readOnly": true
    }
  ]
}
```

### Field Breakdown

| Field        | Type    | Required | Description |
|--------------|---------|----------|-------------|
| `name`       | string  | Yes      | The HomeKit switch name. |
| `url`        | string  | Yes      | GET endpoint to poll for state. |
| `jsonPath`   | string  | No       | Dot-notation path inside JSON to extract a boolean (e.g. `today.isBinDay`). |
| `interval`   | number  | Yes      | Polling interval in **seconds**. |
| `readOnly`   | boolean | No       | Prevents the user toggling the switch in HomeKit (default: true). |

---

## 🧠 How It Works

Every `interval` seconds:

1. The plugin sends a **GET request** to the configured `url`.
2. If a `jsonPath` is provided, that nested value is extracted using dot-notation  
   Example response:
   ```json
   { "today": { "isBinDay": true } }

With jsonPath: `today.isBinDay` → the switch becomes ON.

---

You can then build automations like:
- “When Bin Day turns ON → send a notification”
- “When Server Offline switch turns ON → flash a light”
- “When Rain switch turns ON → close the skylight”

---

### 🧪 Example API Responses

**Simple boolean**

```true```

**JSON response**

```json
{
    "today": {
        "isBinDay": true
    }
}
```

**Nested extraction**

Config:

```
"jsonPath": "today.isBinDay"
```


---

### **🛠 Example: Minimal test API (Node.js)**

```javascript
import express from "express";
const app = express();

app.get("/bins/today", (req, res) => {
res.json({ today: { isBinDay: new Date().getDay() === 2 } }); // Tuesday
});

app.listen(3000, () => console.log("Test API running on port 3000"));
```

Run:

```bash
node server.js
```

Use this in your plugin config:

```
http://localhost:3000/bins/today
```


---

## **🔒 Security Notes**

- Only GET requests are supported currently.
- HTTPS is strongly recommended.
- If your API requires headers or tokens, support is planned for a future release.

---

## **🐞 Debugging**

Enable debug logs in Homebridge UI.

You’ll see logs like:

```
Updated "Bin Day" → true
```

Or errors like:

```
Polling failed for "Bin Day": Request failed with status 500
```

---

## **🔧 Roadmap**

**Planned / potential features:**
- Custom headers / bearer token support
- Cron-style polling
- ContactSensor / OccupancySensor support
- Multiple boolean outputs from a single endpoint
- Retry / backoff strategies
- Webhook-triggered updates (instead of polling)

---

## **🤝 Contributing**

Issues and pull requests are welcome.

If you’d like to extend functionality (headers, cron, service types, richer parsing, etc.), feel free to open an issue or PR.

---

## **📜 License**

MIT