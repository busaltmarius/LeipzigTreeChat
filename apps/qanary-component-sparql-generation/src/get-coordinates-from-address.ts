import { promises as fs } from "fs";
import NodeGeocoder from "node-geocoder";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const options: NodeGeocoder.Options = {
  provider: "openstreetmap",
  timeout: 10000,
  formatter: null,
  email: process.env.NEOGEOCODER_EMAIL,
};

const geocoder = NodeGeocoder(options);

// --- New Constants for Caching & Rate Limiting ---
const CACHE_FILE = "./geocache.json";
const MIN_DELAY_MS = 1100; // 1.1 seconds to be safely over the 1s limit

// In-memory representations
let cache: Record<string, Coordinates> | null = null;
let requestQueue = Promise.resolve();

/**
 * Loads the cache from the JSON text file.
 */
async function loadCache(): Promise<Record<string, Coordinates>> {
  if (cache) return cache;
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    cache = JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist yet or is invalid, start with an empty cache
    cache = {};
  }
  return cache!;
}

/**
 * Saves the memory cache back to the JSON text file.
 */
async function saveCache() {
  if (!cache) return;
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (error) {
    console.error("[geocoder] Failed to save cache to disk:", error);
  }
}

/**
 * Translates a street address to geographic coordinates (latitude, longitude)
 * Includes a local JSON cache and a strict 1.1s rate limiter queue.
 * * @param address The street address to geocode
 * @returns Coordinates with latitude and longitude, or null if not found
 */
export const getCoordinatesFromAddress = async (address: string): Promise<Coordinates | null> => {
  // Normalize the address for consistent caching (e.g., "Hauptstr 1" vs "hauptstr 1")
  address = address + ", Leipzig, Germany"; // Append city and country for better geocoding accuracy
  const normalizedAddress = address.trim().toLowerCase();
  const currentCache = await loadCache();

  // 1. Check Cache First (Instant Return)
  if (currentCache[normalizedAddress]) {
    console.log(`[geocoder] ⚡ Cache hit for address: "${address}"`);
    return currentCache[normalizedAddress];
  }

  // 2. Queue the API Request
  return new Promise((resolve) => {
    requestQueue = requestQueue.then(async () => {
      // Double-check cache inside the queue in case a previous queued task just fetched this exact address
      if (currentCache[normalizedAddress]) {
        resolve(currentCache[normalizedAddress]);
        return;
      }

      console.log(`[geocoder] 🌐 Fetching from OSM: "${address}"`);
      try {
        const results = await geocoder.geocode(address);

        if (results.length === 0) {
          console.warn(`[geocoder] No coordinates found for address: "${address}"`);
          resolve(null);
        } else {
          const result = results[0]!;
          if (result.latitude === undefined || result.longitude === undefined) {
            console.warn(`[geocoder] Incomplete coordinate data for address: "${address}"`);
            resolve(null);
          } else {
            const coords = {
              latitude: result.latitude,
              longitude: result.longitude,
            };

            // Save to memory cache and persist to the text file
            currentCache[normalizedAddress] = coords;
            await saveCache();

            resolve(coords);
          }
        }
      } catch (error) {
        console.error(`[geocoder] Error geocoding address "${address}":`, error);
        resolve(null);
      }

      // 3. Enforce the Rate Limit
      // We force the queue to pause here for 1.1 seconds before allowing the next item to process
      await new Promise((res) => setTimeout(res, MIN_DELAY_MS));
    });
  });
};
