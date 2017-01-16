class Report {
    readonly patient: string;
    readonly glucose: GlucoseRecord[];
    readonly food: FoodRecord[];
    readonly insulin: InsulinRecord[];
    readonly start: moment.Moment;
    readonly end: moment.Moment;

    private _smoothRapidInsulinByDate = [];
    private _smoothLongInsulinByDate = [];
    private _smoothRapidInsulin = [];
    private _smoothLongInsulin = [];

    constructor(patient: string = null, glucose: GlucoseRecord[] = [], food: FoodRecord[] = [], insulin: InsulinRecord[] = [])
    {
        this.patient = patient;
        this.glucose = glucose.sort(function(a, b) { return a.date.valueOf() - b.date.valueOf(); });
        this.insulin = insulin.sort(function(a, b) { return a.date.valueOf() - b.date.valueOf(); });
        this.food = food.sort(function(a, b) { return a.date.valueOf() - b.date.valueOf(); });

        var start = this.glucose[0].date;
        start = this.insulin[0].date < start ? this.insulin[0].date : start;
        start = this.food[0].date < start ? this.food[0].date : start;
        this.start = start;

        var end = this.glucose[this.glucose.length - 1].date;
        end = this.insulin[this.insulin.length - 1].date > end ? this.insulin[0].date : end;
        end = this.food[this.food.length - 1].date > end ? this.food[0].date : end;
        this.end = end;
    }

    /**
     * Generate a list of points with spreading the insulin value using a custom curve to estimate the insulin/minute (Based on NovoRapid)
     * Start acting 15m-30m after application, peaks at 1.5h-2h, lose effect arround 4h-5h (effect multiplied by scale factor).
     * 
     * @param scale A number to mutiply the insulin effective value
     * @returns A list of SmoothInsulinRecord (date, value) with the insuling effect.
     */
    public getSmoothRapidInsulin(scale = 1) {
        if (this._smoothRapidInsulin.length != 0) 
            return this._smoothRapidInsulin;

        this.insulin.forEach(function(element) {
            if (element.insulinType == InsulinRecordType.Rapid) {
                var minutes = element.date.minutes();
                var firstPoint = moment(element.date).startOf('hour');
                if (minutes >= 15 && minutes <= 29) firstPoint.add(15, "minutes");
                if (minutes >= 30 && minutes <= 44) firstPoint.add(30, "minutes");
                if (minutes >= 45 && minutes <= 59) firstPoint.add(45, "minutes");

                // TODO: This function needs some backup from studies, rigth now is a "guess"
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(      0, "minutes"), element.units * 0.001 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(     15, "minutes"), element.units * 0.001 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(     30, "minutes"), element.units * 0.005 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(     45, "minutes"), element.units * 0.023 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(     60, "minutes"), element.units * 0.057 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(  60+15, "minutes"), element.units * 0.079 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(  60+30, "minutes"), element.units * 0.101 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(  60+45, "minutes"), element.units * 0.111 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(    120, "minutes"), element.units * 0.106 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add( 120+15, "minutes"), element.units * 0.101 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add( 120+30, "minutes"), element.units * 0.095 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add( 120+45, "minutes"), element.units * 0.084 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(    180, "minutes"), element.units * 0.068 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add( 180+15, "minutes"), element.units * 0.051 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add( 180+30, "minutes"), element.units * 0.045 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add( 180+45, "minutes"), element.units * 0.033 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add(    240, "minutes"), element.units * 0.022 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add( 240+15, "minutes"), element.units * 0.011 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add( 240+30, "minutes"), element.units * 0.005 * scale);
                this._addSmoothPoint(this._smoothRapidInsulinByDate, moment(firstPoint).add( 240+45, "minutes"), element.units * 0.001 * scale);
            }
        }, this);
        
        for (var key in this._smoothRapidInsulinByDate) {
            var date = moment(parseInt(key));
            if (date != undefined) {
                this._smoothRapidInsulin.push(new SmoothInsulinRecord(date, this._smoothRapidInsulinByDate[key]));
            }
        }
        return this._smoothRapidInsulin;
    }

    /**
     * Generate a list of points with spreading the insulin value using a custom curve to estimate the insulin/hour (Based on Lantus)
     * Start acting 4h-5h after application, peaks at 6h-7h, lose effect arround 20h-22h (effect multiplied by scale factor).
     * 
     * @param scale A number to mutiply the insulin effective value
     * @returns A list of SmoothInsulinRecord (date, value) with the insuling effect.
     */
    public getSmoothLongInsulin(scale = 1) {
        if (this._smoothLongInsulin.length != 0) 
            return this._smoothLongInsulin;

        this.insulin.forEach(function(element) {
            if (element.insulinType == InsulinRecordType.Long) {
                var minutes = element.date.minutes();
                var firstPoint = moment(element.date).startOf('hour');

                // TODO: This function needs some backup from studies, rigth now is a "guess"
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  0, "hour"), element.units * 0.000 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  1, "hour"), element.units * 0.000 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  2, "hour"), element.units * 0.002 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  3, "hour"), element.units * 0.014 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  4, "hour"), element.units * 0.027 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  5, "hour"), element.units * 0.055 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  6, "hour"), element.units * 0.091 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  7, "hour"), element.units * 0.091 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  8, "hour"), element.units * 0.084 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add(  9, "hour"), element.units * 0.075 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 10, "hour"), element.units * 0.069 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 11, "hour"), element.units * 0.068 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 12, "hour"), element.units * 0.067 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 13, "hour"), element.units * 0.056 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 14, "hour"), element.units * 0.052 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 15, "hour"), element.units * 0.049 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 16, "hour"), element.units * 0.044 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 17, "hour"), element.units * 0.039 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 18, "hour"), element.units * 0.038 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 19, "hour"), element.units * 0.036 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 20, "hour"), element.units * 0.027 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 21, "hour"), element.units * 0.014 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 22, "hour"), element.units * 0.002 * scale);
                this._addSmoothPoint(this._smoothLongInsulinByDate, moment(firstPoint).add( 23, "hour"), element.units * 0.000 * scale);
            }
        }, this);
        
        for (var key in this._smoothLongInsulinByDate) {
            var date = moment(parseInt(key));
            if (date != undefined) {
                this._smoothLongInsulin.push(new SmoothInsulinRecord(date, this._smoothLongInsulinByDate[key]));
            }
        }
        return this._smoothLongInsulin;
    }

    private _addSmoothPoint(smoothInsulin: Array<any>, point: moment.Moment, value: number) {
        var initialValue = smoothInsulin[point.valueOf()];
        if (initialValue == undefined) {
            smoothInsulin[point.valueOf()] = value;
        } else {
            smoothInsulin[point.valueOf()] = initialValue + value;
        }
    }
}