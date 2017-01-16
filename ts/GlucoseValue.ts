class GlucoseValue {
    private _value: number;
    readonly unit: GlucoseUnit;

    constructor(value: number, unit: GlucoseUnit) {
        this._value = value;
        this.unit = unit;
    }

    public getValueAsMmolPerL(): number {
        if (this.unit == GlucoseUnit.MmolPerL)
            return this._value;

        return this._value * 18;
    }

        public getValueAsMgPerDl(): number {
        if (this.unit == GlucoseUnit.MgPerDl)
            return this._value;

        return this._value / 18;
    }
}