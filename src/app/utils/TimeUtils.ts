import moment from "moment";


export default abstract class TimeUtils {
    private constructor() {

    }

    /**
     * Fonction: Formatage de date
     * @param date
     */
    public static getTimeStr(date: Date | moment.Moment): string {
        return moment(date).format('D/MM/YYYY[ à ] h:mm');
    }

}