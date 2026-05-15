import { useEffect, useRef, useState } from 'react';
import geo from 'geojs';
import { OutsideJakartaMask } from './OutsideJakartaMask';
import { JakartaBoundary } from './JakartaBoundary';
import { PollutantLayer } from './PollutantLayer';
import { Sidebar } from '../../dashboard/Sidebar';
import { MAP_CENTER, MAP_ZOOM, TILE_URL, TILE_ATTRIBUTION } from '../utils/spatialLogic';
import { type GeoJSMap, type GeoJSLayer } from '@/types';
export function MapContainer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<GeoJSMap | null>(null);
    const [layers, setLayers] = useState<{
        pollutant: GeoJSLayer;
        sensor: GeoJSLayer;
        mask: GeoJSLayer;
        boundary: GeoJSLayer;
    } | null>(null);
    useEffect(() => {
        if (!containerRef.current || mapInstance.current) return;
        const map = geo.map({
            node: containerRef.current,
            center: MAP_CENTER,
            zoom: MAP_ZOOM,
            clampBoundsX: false,
            clampBoundsY: false,
            ingcs: 'EPSG:4326',
            gcs: 'EPSG:3857',
        });
        map.createLayer('osm', {
            url: TILE_URL,
            attribution: TILE_ATTRIBUTION,
            renderer: 'webgl',
        });
        const maskLayer = map.createLayer('feature', {
            features: ['polygon'],
            renderer: 'webgl',
        });
        const pollutantLayer = map.createLayer('feature', {
            features: ['polygon'],
            renderer: 'webgl',
        });
        const sensorLayer = map.createLayer('feature', {
            features: ['point'],
            renderer: 'webgl',
        });
        const boundaryLayer = map.createLayer('feature', {
            features: ['line', 'polygon'],
            renderer: 'webgl',
        });
        mapInstance.current = map as unknown as GeoJSMap;
        setLayers({
            pollutant: pollutantLayer,
            sensor: sensorLayer,
            mask: maskLayer,
            boundary: boundaryLayer
        });
        map.size({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
        let timeoutId: number;
        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries[0] || !mapInstance.current) return;
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                const { width, height } = entries[0].contentRect;
                mapInstance.current?.size({ width, height });
            }, 100);
        });
        resizeObserver.observe(containerRef.current);
        return () => {
            resizeObserver.disconnect();
            window.clearTimeout(timeoutId);
            if (mapInstance.current) {
                mapInstance.current.exit();
                mapInstance.current = null;
            }
        };
    }, []);
    const handleNavigate = (coords: { lat: number; lng: number; zoom: number }) => {
        if (mapInstance.current) {
            mapInstance.current.transition({
                center: { x: coords.lng, y: coords.lat },
                zoom: coords.zoom,
                duration: 1000,
            });
        }
    };
    return (
        <div className="relative w-full h-full bg-slate-900 overflow-hidden">
            <div ref={containerRef} className="w-full h-full outline-none" id="geojs-map-container" />
            {layers && (
                <>
                    <OutsideJakartaMask
                        featureLayer={layers.mask}
                    />
                    <PollutantLayer
                        featureLayer={layers.pollutant}
                        map={mapInstance.current}
                    />
                    <JakartaBoundary
                        featureLayer={layers.boundary}
                        onAreaHover={() => { }}
                    />
                    <div className="absolute top-4 left-4 z-10">
                        <Sidebar onNavigate={handleNavigate} />
                    </div>
                </>
            )}
        </div>
    );
}