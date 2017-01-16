class GlucoseRecord extends DataRecord {
    readonly glucose: GlucoseValue; 
    readonly glucoseType: GlucoseRecordType; 
    
    constructor(id: number, date: moment.Moment, glucoseType: GlucoseRecordType, glucose: GlucoseValue) {
        super(id, date, RecordType.Glucose);
        this.glucoseType = glucoseType;
        this.glucose = glucose;
    }
}