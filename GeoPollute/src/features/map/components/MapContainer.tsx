import { useEffect, useRef, useState } from 'react';
import geo from 'geojs';
import {
    MAP_CENTER,
    MAP_ZOOM,
    TILE_URL,
    TILE_SUBDOMAINS,
    TILE_ATTRIBUTION,
} from '@/features/map/utils/spatialLogic';
import { PollutantLayer } from './PollutantLayer';

export function MapContainer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const featureLayerRef = useRef<any>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = geo.map({
            node: containerRef.current,
            center: MAP_CENTER,
            zoom: MAP_ZOOM,
            clampBoundsX: false,
            clampBoundsY: false,
        });

        map.createLayer('osm', {
            url: TILE_URL,
            subdomains: TILE_SUBDOMAINS,
            attribution: TILE_ATTRIBUTION,
        });

        const featureLayer = map.createLayer('feature', {
            features: ['polygon', 'point'],
            renderer: 'webgl',
        });

        mapRef.current = map;
        featureLayerRef.current = featureLayer;
        setReady(true);

        return () => {
            map.exit();
            mapRef.current = null;
            featureLayerRef.current = null;
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative bg-black">
            {ready && featureLayerRef.current && (
                <PollutantLayer featureLayer={featureLayerRef.current} map={mapRef.current} />
            )}
        </div>
    );
}