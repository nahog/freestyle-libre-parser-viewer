class FoodRecord extends DataRecord {
    readonly carbs?: number;
    
    constructor(id: number, date: moment.Moment, carbs?: number) {
        super(id, date, RecordType.Food);
        this.carbs = carbs;
    } 
}