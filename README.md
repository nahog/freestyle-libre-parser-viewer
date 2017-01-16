# Abbot FreeStyle Libre flash glucose meter Parser/Viewer

## Objective

Create a library to read and manage CSV files created by the FreeStyle libre app to better understand and visualize the report data

## How to install

`npm install`

## How to use the Viewer (user)

Mount a local web-server (for example using node's http-server) and browse to the `index.html` (for example http://127.0.0.1:8080/index.html) to open the main view that lets you import a csv file generated from the Abbott FreeStyle Libre app (or use the test.csv example file) and visualize the data in the HighChart chart.

## How to use the FreeStyleLibreLib (developer)

```javascript
var reader = new FileReader();
reader.readAsText(file);
reader.onload = function() {
    var report = FreeStyleLibreLib.parseReport(reader.result);
}
```

## CSV File Format (actually separated by tabs)

- Line 1:
    - Patient Name **(is this line optional?)**
- Line 2:
    - Headers
        - ID
        - Time **(is YYYY/MM/DD HH:mm the only possible date format?)**
        - Record Type
            - 0: Historic Glucose
            - 1: Scan Glucose
            - 2: **?**
            - 3: **?**
            - 4: Insulin (Need to read if Rapid-Acting Insulin (units) or Long-Acting Insulin (units) has data to know witch is witch, probably appies to the "non numeric" ones too, but is not tested)
            - 5: Food
            - 6: Date change (not implemented)
            - **Is there anything beyond type 6?**
        - Historic Glucose (mmol/L)
            - **Does the column name change if the meter units are not mmol/L?**
        - Scan Glucose (mmol/L)
            - **Does the column name change if the meter units are not mmol/L?**
        - Non-numeric Rapid-Acting Insulin
        - Rapid-Acting Insulin (units)
        - Non-numeric Food
        - Carbohydrates (grams)
        - Non-numeric Long-Acting Insulin
        - Long-Acting Insulin (units)
        - Notes
        - Strip Glucose (mmol/L)
            - **Does the column name change if the meter units are not mmol/L?**
        - Ketone (mmol/L)
            - **Does the column name change if the meter units are not mmol/L?**
        - Meal Insulin (units)
        - Correction Insulin (units)
        - User Change Insulin (units)
        - Previous Time
        - Updated Time
        - **Are these all the possible columns?**
        - **Can the columns have another name if the meter or app is set up in other language?**
- Lines > 2
    - Data