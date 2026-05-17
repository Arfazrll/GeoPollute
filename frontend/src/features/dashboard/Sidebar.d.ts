interface Props {
    onNavigate: (coords: {
        lat: number;
        lng: number;
        zoom: number;
    }) => void;
}
export declare function Sidebar({ onNavigate }: Props): import("react/jsx-runtime").JSX.Element;
export {};
