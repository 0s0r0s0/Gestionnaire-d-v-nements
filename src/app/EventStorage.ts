import config from '../../app.config.json';
import IEventData from "./IEventData";

const localStorageName: string = 'events';

class EventStorage {
    public data: IEventData[];

    public constructor() {
        this.refreshData();
    }

    private static getFromLocalStorage(): IEventData[] {
        const storageData: string | null = localStorage.getItem( localStorageName );

        if ( !storageData) return [];

        return  JSON.parse( storageData ) as IEventData[];
    }

    public refreshData(): void {
        this.data = EventStorage.getFromLocalStorage();
    }

    public add( data: IEventData ): void {
        this.data.push( data );
    }

    public saveToLocalStorage(): void {
        localStorage.setItem( localStorageName, JSON.stringify( this.data ) );
    }
}

const eventStorage: EventStorage = new EventStorage();

export default eventStorage;