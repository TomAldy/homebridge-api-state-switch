import type {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logging,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { ApiStatePlatformAccessory } from './platformAccessory.js';

/**
 * ApiStateSwitchPlatform
 * Main entry point for your plugin.
 * Handles cache restoration, discovery, and registration of API-driven switches.
 */
export class ApiStateSwitchPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;

  // Cache of restored accessories
  public readonly accessories: Map<string, PlatformAccessory> = new Map();
  public readonly discoveredCacheUUIDs: string[] = [];

  constructor(
        public readonly log: Logging,
        public readonly config: PlatformConfig,
        public readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    this.log.debug('Finished initializing platform:', this.config.name);

    // Start discovery after Homebridge loads cached accessories
    this.api.on('didFinishLaunching', () => {
      this.log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  /**
     * Called when Homebridge restores an accessory from cache.
     */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.set(accessory.UUID, accessory);
  }

  /**
     * Discover and register all API switches from config.
     */
  discoverDevices() {
    const switches = this.config.switches;

    if (!Array.isArray(switches) || switches.length === 0) {
      this.log.warn('No switches configured. Plugin will do nothing.');
      return;
    }

    for (const sw of switches) {
      // Generate stable UUID from switch name
      const uuid = this.api.hap.uuid.generate(sw.name);
      const existingAccessory = this.accessories.get(uuid);

      if (existingAccessory) {
        // Restore previously cached accessory
        this.log.info('Restoring existing accessory:', existingAccessory.displayName);

        existingAccessory.context.config = sw;
        new ApiStatePlatformAccessory(this, existingAccessory);

        // Keep track that this accessory exists
        this.discoveredCacheUUIDs.push(uuid);

      } else {
        // Add a brand new accessory
        this.log.info('Adding new accessory:', sw.name);

        const accessory = new this.api.platformAccessory(sw.name, uuid);
        accessory.context.config = sw;

        new ApiStatePlatformAccessory(this, accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.discoveredCacheUUIDs.push(uuid);
      }
    }

    // Remove cached accessories no longer configured
    for (const [uuid, accessory] of this.accessories) {
      if (!this.discoveredCacheUUIDs.includes(uuid)) {
        this.log.info('Removing stale accessory:', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}