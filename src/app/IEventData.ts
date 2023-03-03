import {LngLatLike} from "mapbox-gl"

export default interface IEventData {
    nom: string;
    description: string;
    dateDeDebut: Date;
    dateDeFin: Date;
    geoposition: LngLatLike;
}