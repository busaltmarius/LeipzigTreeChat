import type { EnrichedInstance } from "./get-annotation-information.ts";
import { type Coordinates, getCoordinatesFromAddress } from "./get-coordinates-from-address.ts";

interface AddressComponents {
  street?: string;
  streetNumber?: string;
  zip?: string;
}

/**
 * Extracts address components (street, street number, zip) from enriched instances
 *
 * @param instances - Array of enriched instances
 * @returns Object with extracted address components
 */
function extractAddressComponents(instances: EnrichedInstance[]): AddressComponents {
  const components: AddressComponents = {};

  for (const instance of instances) {
    switch (instance.entityType) {
      case "STREET":
        components.street = instance.exactQuote;
        break;
      case "STREET_NUMBER":
        components.streetNumber = instance.exactQuote;
        break;
      case "ZIP":
        components.zip = instance.exactQuote;
        break;
    }
  }

  return components;
}

/**
 * Builds a complete address string from address components
 *
 * @param components - Address components
 * @returns Formatted address string, or null if no meaningful components found
 */
function buildAddressString(components: AddressComponents): string | null {
  const parts: string[] = [];

  if (components.street) {
    parts.push(components.street);
  }

  if (components.streetNumber) {
    parts.push(components.streetNumber);
  }

  if (components.zip) {
    parts.push(components.zip);
  }

  if (parts.length === 0) {
    return null;
  }

  // Build address in format: "Street StreetNumber, ZIP"
  let address = parts.slice(0, components.streetNumber ? 2 : 1).join(" ");
  if (components.zip) {
    address += `, ${components.zip}`;
  }

  return address;
}

/**
 * Extracts coordinates from street/street number/zip information in instances
 *
 * @param instances - Array of enriched instances
 * @returns Coordinates if address components found, null otherwise
 */
export async function extractCoordinatesFromInstances(instances: EnrichedInstance[]): Promise<Coordinates | null> {
  // Extract address components
  const components = extractAddressComponents(instances);

  // Check if we have at least some address information
  if (!components.street && !components.zip) {
    console.log("[coordinates] No street or zip found in instances");
    return null;
  }

  // Build address string
  const address = buildAddressString(components);
  if (!address) {
    console.log("[coordinates] Could not build address from components");
    return null;
  }

  console.log(`[coordinates] Built address from instances: "${address}"`);

  // Get coordinates using the geocoder
  try {
    const coords = await getCoordinatesFromAddress(address);
    if (coords) {
      console.log(`[coordinates] Found coordinates: ${coords.latitude}, ${coords.longitude}`);
    }
    return coords;
  } catch (error) {
    console.error("[coordinates] Error getting coordinates:", error);
    return null;
  }
}
