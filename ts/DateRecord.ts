class DateRecord {
    readonly date: moment.Moment;
    readonly type: RecordType;
    
    constructor(date: moment.Moment, type: RecordType) {
        this.date = date;
        this.type = type;
    }
}