const importer = require('./import.js');
const exporter = require('./export.js');
const prompt = require('prompt');
const program = require('commander');
const async = require('async');
const fs = require('fs');

program
    .version('1.0.0')
    .description('Import an export dashboard templates with Grafana. See https://github.com/Monkat-Company/grafana-dashboard-migrator for more details.')
    .option('-c, --config <config filename>', 'The configuration filename')

    .on('--help', () => {
        console.log(' Example:');
        console.log();
        console.log(
            '    $ grafanaDashboard -c my-config.json'
        );
        console.log()
    })
    .parse(process.argv);

program.parse(process.argv);

if (!program.config) {
    program.help();
    process.exit()
}
if (process.env.GRAFANA_API_KEY != null) {
    console.log("Grafana API Key found... using..");
    runIt();

} else {

    let schema = {
        properties: {
            apikey: {
                hidden: true,
                required: true
            }
        }
    };

    prompt.start();

    prompt.get(schema, function (err, result) {
        process.env.GRAFANA_API_KEY = result.apikey;
        runIt();
    });
}

function runIt() {

    let importJson = JSON.parse(fs.readFileSync(program.config));
    async.eachSeries(importJson['dashboards'], async function (eachItem, next) {
        console.log(eachItem)
        if (importJson['type'] === 'import') {
            await importer.runIt(importJson['host'], eachItem['id'], eachItem['name'], importJson['environment'], eachItem['template'])
                .catch((err) => {
                    console.log('Error: ' + err);
                    process.exit()
                });
        } else if (importJson['type'] === 'export') {
            await exporter.runIt(importJson['host'], eachItem['id'], eachItem['template'], importJson['findString'])
                .catch((err) => {
                    console.log('Error: ' + err);
                    process.exit()
                });
        }
        next();

    }, function () {
        console.log('done!');
        process.exit()
    });
}



