class SmoothInsulinRecord extends DateRecord {
    readonly units: number; 
    
    constructor(date: moment.Moment, units: number) {
        super(date, RecordType.SmoothInsulin);
        this.units = units;
    }
}