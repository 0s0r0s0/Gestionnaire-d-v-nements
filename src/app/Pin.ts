import IEventData from "./IEventData";
import mapboxgl, {LngLatBoundsLike, LngLatLike, Map, MapboxOptions, Marker, Popup} from 'mapbox-gl';

import moment from "moment";

import TimeUtils from "./utils/TimeUtils";

import jQuery from 'jquery';
const $: JQueryStatic = jQuery;

export default class Pin {
    private readonly map: Map;
    private readonly event : IEventData;
    private marker: Marker;
    private popup: Popup;
    private markerDom: HTMLElement;
    private additionalClass: string;

    public constructor(map: Map, event: IEventData, additionalClass: string = '') {
        this.map = map;
        this.event = event;
        this.additionalClass = additionalClass;
    }

    /**
     * Fonction: Création des pin
     */
    public draw(): void {
        this.markerDom = $(`<div class="marker ${this.additionalClass}">`).get(0);


        this.marker = new Marker({
            element: this.markerDom
        });

        this.popup = new Popup({
            className: 'popup',
            offset: 22
        });

        this.popup.setHTML(`
            <div class="popup-inner">
                <h4>${this.event.nom}</h4>
                <p>${this.event.description}</p>
                <h5>Du ${TimeUtils.getTimeStr(this.event.dateDeDebut)} au ${TimeUtils.getTimeStr(this.event.dateDeFin)}</h5>
                <h5>${moment(this.event.dateDeDebut).startOf('day').fromNow()}</h5>
            </div>
        `);

        this.marker
            .setLngLat(this.event.geoposition)
            .setPopup(this.popup)
            .addTo(this.map)
        ;
    }

    /**
     * Fonction: Suppression des marqueurs
     */
    public remove(): void { if(this.marker) this.marker.remove(); }

    public get UsedMarker(): boolean { return !this.marker; }

    public get Event(): IEventData { return this.event; }
    public get Popup(): Popup { return this.popup; }
    public get Marker(): Marker { return this.marker; }
    public get MarkerDom(): HTMLElement { return this.markerDom; }
    public get Map(): Map { return this.map; }
}