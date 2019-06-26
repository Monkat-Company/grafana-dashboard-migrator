const rp = require('request-promise');
const fs = require('fs-extra');
const {forEach} = require('lodash');

const options = {};

let handleResponse = (body) => new Promise((resolve, reject) => {

    console.log(body);

    console.log('Dashboard found');

    const info = JSON.parse(body);

    info['dashboard']['title'] = "SETME";
    delete info['dashboard']['id'];
    delete info['meta']['slug'];
    delete info['meta']['url'];
    forEach(info['dashboard']['panels'], (panels) => {
        forEach(panels['targets'], (targets) => {
            let val = targets['dimensions']['FunctionName'];
            if (val != null) {
                val = val.replace(options.findString, 'SETME-');
                targets['dimensions']['FunctionName'] = val;
            } else {
                val = targets['dimensions']['ApiName'];
                val = val.replace(options.findString, 'SETME-');
                targets['dimensions']['ApiName'] = val;
            }

        })
    });

    fs.outputFile(options.filename, JSON.stringify(info, null, '\t'), function (err) {
        if (err) {
            reject(err);
        }

        console.log("The file was created!");
        resolve();
    });

});

let getDashboard = () => {
    return new Promise((resolve, reject) => {

        const getOptions = {
            url: options.host + '/api/dashboards/uid/' + options.dashboard,
            headers: {
                'Authorization': 'Bearer ' + process.env.GRAFANA_API_KEY
            }
        };

        return rp(getOptions)
            .then((response) => resolve(response))
            .catch((error) => {
                reject(error)
            });

    });
}

async function runIt(host, id, template, findString) {

    options.dashboard = id;
    options.filename = template;
    options.host = host;
    options.findString = findString;
    return await getDashboard()
        .then(handleResponse);
}

module.exports.runIt = runIt;