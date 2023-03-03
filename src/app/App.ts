import config from '../../app.config.json';
import EventStorage from "./EventStorage";
import IEventData from "./IEventData";
import Pin from './Pin';

import TimeUtils from "./utils/TimeUtils";


import jQuery from 'jquery';

import mapboxgl, {Marker, LngLatLike, Map, MapboxOptions} from 'mapbox-gl';
import eventStorage from "./EventStorage";
import moment from "moment";
moment.locale('fr');


const $: JQueryStatic = jQuery;


class App {

    private greenFilter: boolean = true;
    private orangeFilter: boolean = true;
    private redFilter: boolean = true;
    private tempMarker: Marker | null = null;

    public $loader: JQuery;
    public $cmdArea: JQuery;
    public $validate: JQuery;
    public map: Map;
    public $nom: JQuery;
    public $description: JQuery;
    public $dateDeDebut: JQuery;
    public $dateDeFin: JQuery;
    public $lat: JQuery;
    public $lon: JQuery;
    public $center: JQuery;
    public eventPins: Pin[];
    public $filter: JQuery;
    public $greenfilter: JQuery;
    public $orangefilter: JQuery;
    public $redfilter: JQuery;
    public $placeSelect: JQuery;
    public $layerList: JQuery;
    public $inputs: JQuery;



    constructor() {
        this.$loader = $( '#loader' );
        this.$cmdArea = $( '#command-panel' )
        this.$validate = $( '#validate');
        this.$nom = $( '#nom');
        this.$description = $( '#description' );
        this.$dateDeDebut = $( '#dateDeDebut' );
        this.$dateDeFin = $( '#dateDeFin' );
        this.$lat = $('#lat');
        this.$lon = $('#lon');
        this.$center = $('#center' );
        this.eventPins = [];
        this.$filter = $( '#filter' );
        this.$greenfilter = $( '#green-pin' );
        this.$orangefilter = $( '#orange-pin' );
        this.$redfilter = $( '#red-pin' );
        this.$placeSelect = $( '#place-select' );
        this.$layerList = $( '#menu-style' );
        this.$inputs = $('input');

        /***
         * Listeners: Filtres
         */
        $('#red-filter').on('change', () => {
            this.redFilter = !this.redFilter;
            this.refreshPins();
        });

        $('#orange-filter').on('change', () => {
            this.orangeFilter = !this.orangeFilter;
            this.refreshPins();
        });

        $('#green-filter').on('change', () => {
            this.greenFilter = !this.greenFilter;
            this.refreshPins();
        });


    }

    /**
     * Fonction: Lancement de l'appli
     */
    public start(): void {
        this.initMap();
        this.$cmdArea.hide();


        this.$validate.on( 'click', this.onSaveButtonClick.bind(this));
        this.$center.on( 'click', this.centerMapClick.bind(this));
    }

    /**
     * Fonction: Initialisation de la map
     */
    public initMap(): void {
        const mapOptions: MapboxOptions = {
            container: 'map',
            style: 'mapbox://styles/mapbox/outdoors-v11',
            zoom: 5.5,
            minZoom: 2,
            center: [2.2, 46.4]
        };

        mapboxgl.accessToken = config.api.mapboxgl.accessToken;
        this.map = new mapboxgl.Map( mapOptions );
        this.map.on( 'load', this.onMapLoad.bind( this ) );

        this.map.on('click', this.onMapClick.bind(this));

    }

    /**
     * Fonction: Chargement de la Map
     */
    private onMapLoad(): void {
        this.map.resize();
        this.$loader.fadeOut();

        $('input[type="radio"]').on(
            'click',
            this.switchLayer.bind(this)
        );

        this.loadPinsFromLocalStorage();
    }

    /**
     * Fonction: Listener pour les click sur la Map
     * @param e
     */
    private onMapClick(e: any): void {
           this.$lon.val(e.lngLat.lng);
           this.$lat.val(e.lngLat.lat);

        if(this.tempMarker) this.tempMarker.remove();

             this.tempMarker = new mapboxgl.Marker()
                 .setLngLat(e.lngLat)
                 .addTo(this.map);

        this.$placeSelect.hide();
        this.$cmdArea.show();
    }

    /**
     * Fonction: Reset du Formulaire
     */
    private cleanForm() {
        this.$nom.val( '' );
        this.$description.val( '' );
        this.$dateDeDebut.val( '' );
        this.$dateDeFin.val('');
        this.$lat.val( '' );
        this.$lon.val('');
    }

    /**
     * Fonction: Sauvegarde du formulaire
     */
    private onSaveButtonClick() {
        const newTitle = (<string>this.$nom.val()).trim();
        const newDescription = (<string>this.$description.val()).trim();
        const newDateStart = (<string>this.$dateDeDebut.val()).trim();
        const newDateEnd = (<string>this.$dateDeFin.val()).trim();
        const newLat = this.$lat.val();
        const newLon = this.$lon.val();

        if( !newTitle || !newDescription || !newDateStart || !newDateEnd || !newLat || !newLon || !this.tempMarker ){
            return;
        }

        const jsonIEventData: IEventData = {
            nom: newTitle,
            description: newDescription,
            dateDeDebut: new Date(newDateStart),
            dateDeFin: new Date(newDateEnd),
            geoposition: [newLon, newLat] as LngLatLike
        };
        this.tempMarker.remove();
        this.registerEvent(jsonIEventData);
        this.cleanForm();
    }

    /**
     * Fonction: Enregistrement de l'Event
     * @param event
     */
    private registerEvent(event: IEventData) {
        this.eventPins.push(new Pin(this.map, event));
        this.saveToLocalStorage();
        this.refreshPins();
    }

    /**
     * Fonction: Rechargement des marqueurs
     */
    private refreshPins(): void {
        this.clearPins();
        this.loadPinsFromLocalStorage();
    }

    /**
     * Fonction: Sauvegarde dans localstorage
     */
    private saveToLocalStorage(): void {
        const arr: IEventData[] = [];
        for(const pin of this.eventPins) {
            arr.push(pin.Event);
        }
        eventStorage.data = arr;
        eventStorage.saveToLocalStorage();
    }

    /**
     * Fonction: Chargement des marqueurs
     */
    private loadPinsFromLocalStorage(): void {
        eventStorage.refreshData();
        for(let event of eventStorage.data) {
            const color: string = App.getEventPinColor(event);
            const pin: Pin = new Pin(this.map, event, color);
            this.eventPins.push(pin);
            if((color == 'orange' && this.orangeFilter) ||
                (color == 'red' && this.redFilter) ||
                (color == 'green' && this.greenFilter)
            ) {
                pin.draw();
            }
        }
    }

    /**
     * Fonction: Suppression des marqueurs
     */
    private clearPins(): void {
        for(const pin of this.eventPins) {
            pin.remove();
        }
        this.eventPins = [];
    }

    /**
     * Fonction: Centrer la Map
     */
    private centerMapClick(): void {
        this.map.setCenter([2.2, 46.4]);
        this.map.setZoom(5.5);
    }


    /**
     * Fonction: Obtenir la couleur du pin
     * @param event
     */
    private static getEventPinColor(event: IEventData): string { // 259200s in 3 days
        if(moment(new Date()) >= moment(event.dateDeDebut )) return 'red';
        if ( new Date(event.dateDeDebut).getTime() - Date.now() <= 259200000 ) return 'orange';
        return 'green';
    }

    /**
     * Fonction: Changement style de Map
     * @param layer
     */
    private switchLayer(layer: any): void {
        let layerId = layer.target.id;
        this.$loader.show();
        this.map.setStyle('mapbox://styles/mapbox/' + layerId);
        this.map.on('idle', () => this.$loader.fadeOut() );
    }

}

const app = new App;

export default app;


