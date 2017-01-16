class InsulinRecord extends DataRecord {
    readonly units: number; 
    readonly insulinType: InsulinRecordType; 
    
    constructor(id: number, date: moment.Moment, insulinType: InsulinRecordType, units: number) {
        super(id, date, RecordType.Insulin);
        this.insulinType = insulinType;
        this.units = units;
    }
}