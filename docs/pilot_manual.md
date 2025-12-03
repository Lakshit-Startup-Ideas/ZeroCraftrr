# ZeroCraftr Pilot Onboarding Manual

## 1. Introduction
This guide explains how to onboard a new factory site and its devices onto the ZeroCraftr platform.

## 2. Pre-requisites
- Admin access to ZeroCraftr Dashboard.
- List of physical devices and their hardware IDs (MAC address or Serial Number).
- Network connectivity for devices (Outbound MQTT port 1883/8883).

## 3. Step-by-Step Onboarding

### Step 1: Create Organization & Site
1.  Log in to the Dashboard.
2.  Navigate to **Settings** (or Admin panel).
3.  Create a new **Organization** (e.g., "Client X").
4.  Create a **Site** under that organization (e.g., "Plant 1").

### Step 2: Register Devices
1.  Go to the **Devices** page.
2.  Click **Add Device**.
3.  Enter:
    - **Name**: Human-readable name (e.g., "Furnace A").
    - **Device ID**: The unique hardware ID used in MQTT topics.
    - **Site**: Select "Plant 1".
4.  Save. The device is now "Active".

### Step 3: Configure Edge Gateway
Configure your physical IoT Gateway to publish to:
- **Broker**: `mqtt.zerocraftr.com` (or your IP)
- **Topic**: `telemetry/{device_id}`
- **Payload Format**:
  ```json
  {
    "temperature": 120.5,
    "pressure": 101.3,
    "vibration": 0.05,
    "power_usage": 450.0
  }
  ```

### Step 4: Verify Data
1.  Go to **Dashboard**.
2.  Select the new device.
3.  Check if "Last Seen" updates and charts show data.

## 4. Troubleshooting
- **No Data**: Check Gateway logs for MQTT connection errors.
- **Invalid Data**: Ensure JSON payload matches the schema above.
- **Alerts**: Check the **Alerts** page for system warnings.
