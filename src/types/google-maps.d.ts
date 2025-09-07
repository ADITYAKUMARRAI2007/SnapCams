declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      panTo(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
    }

    interface MapOptions {
      center: LatLng | LatLngLiteral;
      zoom: number;
      styles?: MapTypeStyle[];
      disableDefaultUI?: boolean;
      gestureHandling?: string;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      mapId?: string;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    // Deprecated Marker (for compatibility)
    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: () => void): void;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map: Map;
      icon?: Icon | string;
      title?: string;
    }

    // New Advanced Marker Element
    namespace marker {
      class AdvancedMarkerElement {
        constructor(options: AdvancedMarkerElementOptions);
        map: Map | null;
        position: LatLng | LatLngLiteral | null;
        content: HTMLElement | null;
        title: string;
        addListener(eventName: string, handler: () => void): void;
      }

      interface AdvancedMarkerElementOptions {
        map: Map;
        position: LatLng | LatLngLiteral;
        content?: HTMLElement;
        title?: string;
      }

      interface PinElement {
        background?: string;
        borderColor?: string;
        glyphColor?: string;
        scale?: number;
      }

      class PinElement {
        constructor(options?: Partial<PinElement>);
        element: HTMLElement;
      }
    }

    interface Icon {
      url: string;
      scaledSize: Size;
      anchor: Point;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers: MapTypeStyler[];
    }

    interface MapTypeStyler {
      color?: string;
      gamma?: number;
      lightness?: number;
      weight?: string;
      saturation?: string;
      visibility?: string;
    }
  }
}

export {};