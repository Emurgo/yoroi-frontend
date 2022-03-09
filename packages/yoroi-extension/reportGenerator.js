
// @flow
const reporter = require('cucumber-html-reporter');

const options = {
        theme: 'bootstrap',
        jsonFile: 'reports/cucumberReport.json',
        output: 'reports/cucumberReport.html',
        reportSuiteAsScenarios: true,
        scenarioTimestamp: true,
        launchReport: true,
       // screenshotsDirectory: './testScreenshots/',
        storeScreenshots: false,
        metadata: {
            'App Version': '0.3.2',
            'Test Environment': 'Dev',
            'Browser': 'Chrome  97',
            'Platform': 'MacPro',
            'Parallel': 'Scenarios',
            'Executed': 'Local'
        }
    };

    reporter.generate(options);
