/// <reference path="DateRecord.ts" />

class DataRecord extends DateRecord {
    readonly id: number;
    
    constructor(id: number, date: moment.Moment, type: RecordType) {
        super(date, type);
        this.id = id;
    }
}