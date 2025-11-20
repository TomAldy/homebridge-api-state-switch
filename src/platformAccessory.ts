import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';
import axios from 'axios';

import type { ApiStateSwitchPlatform } from './platform.js';
import { getJsonValue } from './utils/getJsonValue.js';

/**
 * ApiStatePlatformAccessory
 * One instance of this class is created for each accessory the platform registers.
 * Each accessory exposes a single Switch service whose ON state is determined
 * by polling a user-defined HTTP endpoint.
 */
export class ApiStatePlatformAccessory {
  private service: Service;
  private pollingTimer?: NodeJS.Timeout;

  constructor(
        private readonly platform: ApiStateSwitchPlatform,
        private readonly accessory: PlatformAccessory,
  ) {
    const config = accessory.context.config;

        //
        // ───────────────────────────────────────────────────────────────
        //   Accessory Info
        // ───────────────────────────────────────────────────────────────
        //
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
          .setCharacteristic(this.platform.Characteristic.Manufacturer, 'TomAldy')
          .setCharacteristic(this.platform.Characteristic.Model, 'API State Switch')
          .setCharacteristic(this.platform.Characteristic.SerialNumber, config.name);

        //
        // ───────────────────────────────────────────────────────────────
        //   Create Switch Service (primary service)
        // ───────────────────────────────────────────────────────────────
        //
        this.service =
            this.accessory.getService(this.platform.Service.Switch)
            || this.accessory.addService(this.platform.Service.Switch);

        // The name displayed in the Home app
        this.service.setCharacteristic(this.platform.Characteristic.Name, config.name);

        //
        // ───────────────────────────────────────────────────────────────
        //   Characteristic Handlers
        // ───────────────────────────────────────────────────────────────
        //
        // GET handler (reads last known state, updated via polling)
        this.service.getCharacteristic(this.platform.Characteristic.On)
          .onGet(this.handleGet.bind(this));

        // SET handler (only if readOnly = false)
        if (!config.readOnly) {
          this.service.getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.handleSet.bind(this));
        }

        //
        // ───────────────────────────────────────────────────────────────
        //   Start polling loop
        // ───────────────────────────────────────────────────────────────
        //
        this.startPolling();
  }

  /**
     * Handle GET requests from HomeKit.
     * Returns the cached state (updated through polling).
     */
  async handleGet(): Promise<CharacteristicValue> {
    return this.service.getCharacteristic(this.platform.Characteristic.On)
      .value as boolean;
  }

  /**
     * Handle SET requests from HomeKit.
     * Only active if readOnly = false.
     * For now, this plugin does not send commands back to the API.
     */
  async handleSet(value: CharacteristicValue) {
    const config = this.accessory.context.config;

    if (config.readOnly) {
      // User toggling does nothing in read-only mode.
      return;
    }

    // Placeholder:
    this.platform.log.debug(
      `Set request received for ${this.accessory.displayName}:`,
      value,
    );
  }

  /**
     * Start the API polling loop.
     */
  startPolling() {
    const config = this.accessory.context.config;
    const intervalMs = (config.interval ?? 3600) * 1000;

    const poll = async () => {
      try {
        const response = await axios.get(config.url);

        let state = false;

        if (config.jsonPath) {
          state = getJsonValue(response.data, config.jsonPath);
        } else {
          // If JSON path not used, try interpreting direct body
          state =
                        response.data === true ||
                        response.data === 'true' ||
                        response.data === 1 ||
                        response.data === '1';
        }

        this.service.updateCharacteristic(this.platform.Characteristic.On, state);

        this.platform.log.debug(
          `Updated "${this.accessory.displayName}" → ${state}`,
        );

      } catch (err) {
        this.platform.log.warn(
          `Polling failed for "${this.accessory.displayName}": ${err}`,
        );
      }
    };

    // Perform initial poll immediately
    poll();

    // Start repeating timer
    this.pollingTimer = setInterval(poll, intervalMs);
  }
}