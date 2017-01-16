class FreeStyleLibreLib {

    /**
     * Parses a text file with a CVS with Freestyle Libre app report data
     * 
     * @returns A Report object will all the data on it
     */
    public static parseReport(reportFile: string): Report {
        var rawJson = FreeStyleLibreLib._parseCsv(reportFile);
        var patient:string = null;
        if (rawJson != null && rawJson[0] != null && typeof rawJson[0] == 'string') {
            patient = rawJson[0];
        }
        return FreeStyleLibreLib._createReport(patient, rawJson);
    }

    private static _createReport(patient: string, rawJson: any): Report {
        var glucose: GlucoseRecord[] = [];
        var food: FoodRecord[] = [];
        var insulin: InsulinRecord[] = [];
        rawJson.forEach(function(element) {
            var record = FreeStyleLibreLib._parseRecord(element);
            if (record != null) {
                switch (record.type) {
                    case RecordType.Glucose:
                        glucose.push(record as GlucoseRecord);
                        break;
                    case RecordType.Food:
                        food.push(record as FoodRecord);
                        break;
                    case RecordType.Insulin:
                        insulin.push(record as InsulinRecord);
                        break;
                }
            }
        }, this);
        return new Report(patient, glucose, food, insulin);
    }

    private static _parseRecord(element: any): DataRecord {
        // TODO: Allow settings to format date in other ways
        var date = moment(element.Time, "YYYY/MM/DD HH:mm");
        switch (element.RecordType) {
            case "0":
                return new GlucoseRecord(parseFloat(element.ID), date, GlucoseRecordType.History, new GlucoseValue(parseFloat(element.HistoricGlucose), GlucoseUnit.MmolPerL));
            case "1":
                return new GlucoseRecord(parseFloat(element.ID), date, GlucoseRecordType.Scan, new GlucoseValue(parseFloat(element.ScanGlucose), GlucoseUnit.MmolPerL));
            case "4":
                if (element.RapidActingInsulinUnits.trim() != "") return new InsulinRecord(parseFloat(element.ID), date, InsulinRecordType.Rapid, parseFloat(element.RapidActingInsulinUnits));
                if (element.LongActingInsulinUnits.trim() != "") return new InsulinRecord(parseFloat(element.ID), date, InsulinRecordType.Long, parseFloat(element.LongActingInsulinUnits));
                break;
            case "5":
                return new FoodRecord(parseFloat(element.ID), date, parseFloat(element.Carbs));
        }
        return null;
    }

    private static _parseCsv(csvFile: string): Array<any> {
        var lines = csvFile.split("\n");
        var result = [];
        var init = 0;

        if (lines[0].indexOf("\t") < 0) {
            result.push(lines[0]);
            init = 1;
        }
        var headers = lines[init].split("\t");
        var sanitizedHeaders = [];
        headers.forEach(function(header) {
            sanitizedHeaders.push(header.replace(/ /g,'')
                                        .replace(/-/g,'')
                                        .replace(/\(grams\)/g,'')
                                        .replace(/\(mmol\/L\)/g,'')
                                        .replace(/\(units\)/g,'Units'));
        }, this);

        for (var i = 1 + init; i < lines.length; i++) {
            var obj = {};
            var row = lines[i];
            var queryIdx = 0;
            var startValueIdx = 0;
            var idx = 0;

            while (idx < row.length) {
                // If we meet a double quote we skip until the next one
                var c = row[idx];

                if (c === '"') {
                    do {
                        c = row[++idx];
                    } while (c !== '"' && idx < row.length - 1);
                }

                if (c === '\t' || /* handle end of line with no comma */ idx === row.length - 1) {
                    // We've got a value!
                    var value = row.substr(startValueIdx, idx - startValueIdx).trim();

                    // Skip first double quote
                    if (value[0] === '"') {
                        value = value.substr(1);
                    }
                    // Skip last comma
                    if (value[value.length - 1] === '\t') {
                        value = value.substr(0, value.length - 1);
                    }
                    // Skip last double quote
                    if (value[value.length - 1] === '"') {
                        value = value.substr(0, value.length - 1);
                    }

                    var key = sanitizedHeaders[queryIdx++];
                    obj[key] = value.trim();
                    startValueIdx = idx + 1;
                }

                ++idx;
            }

            result.push(obj);
        }
        return result;
    }

}