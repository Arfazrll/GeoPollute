interface Props {
    onNavigate: (coords: {
        lat: number;
        lng: number;
        zoom: number;
    }) => void;
}
export declare function AreaSearch({ onNavigate }: Props): import("react/jsx-runtime").JSX.Element;
export {};
